/**
 * Created by ethan on 2/7/17.
 */
import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../RequestService/requests';
import { ProfileModel } from '../../shared/profile.model';
import { FieldsInOrder, SelectFields, SearchableFields, FieldsForUpdating } from '../../shared/fields';
import { CURRENT_YEAR, MEDIA_URI, DEFAULT_PHOTO, ARCHIVE_YEARS } from '../../config';

@Component({
  selector: 'update-profile',
  templateUrl: 'update.component.html',
  styleUrls: ['update.component.css'],
  providers: [
    RequestService,
  ],
})

/*
 * This is the component that handles a user updating their profile.
 * */
export class UpdateComponent implements OnInit {
  constructor(private requestService: RequestService) { }

  profile: ProfileModel = new ProfileModel("{}");
  fullProfile: ProfileModel = new ProfileModel("{}");
  fields: string[] = FieldsForUpdating;
  selectables: any = SelectFields;
  searchables: any = SearchableFields;
  possiblePhotos: string[];
  searchYears: string[];
  justClicked: string;

  /*
  * On initialization of this component, call the verify function to ensure that the user is logged in.
  * Take the returned minimal profile data and use that to query the server for the user's full profile.
  * This full profile is then set as fullProfile.
  * */
  ngOnInit() {
    this.requestService.verify((data) => {
      this.profile = data;
      this.requestService.get("/profile/" + CURRENT_YEAR + "/" + this.profile.username, (data) => {
        this.fullProfile = this.Decode(data);
        this.getPhotos();
      }, undefined);
    });
  }

  // This function gets the url's of all the possible photos for a user from the endpoint on the server.
  getPhotos(): any {
    var SEARCH_YEARS = 3;  // SEARCH_YEARS is the number of years to get profile photo options from.
    this.possiblePhotos = [DEFAULT_PHOTO];
    this.searchYears = ARCHIVE_YEARS.slice(0, SEARCH_YEARS);
    this.searchYears.unshift(CURRENT_YEAR);
    this.justClicked = this.profile.photo;
    // display profile photo options
    for (let YEAR of this.searchYears) {
      this.requestService.get(MEDIA_URI + "/listProfilePhotos.php?wwuid=" + this.fullProfile.wwuid + "&year=" + YEAR, (photos) => {
        this.possiblePhotos = this.possiblePhotos.concat(photos)
      }, undefined);
    }
  }

  // Function to change which picture is set for a user. For use in the html to select a picture.
  changePhoto(url: string): void {
    this.fullProfile.photo = url;
  }

  // Get the link for a given photo
  getPhotoLink(uri: string): string {
    if (!uri || uri == '') uri = this.fullProfile.photo || DEFAULT_PHOTO;
    let photo = MEDIA_URI + "/img-sm/" + uri.replace(MEDIA_URI, "");
    photo = photo.replace("//", "/");
    return photo;
  }

  // Takes url-safe strings and converts them into valid ASCII so that Javascript can handle them properly.
  // e.g. it takes a string like "peanut butter &amp; jelly" and turns it into "peanut butter & jelly"
  Decode(data: any): any {
    if (data.hasOwnProperty('username')) {
      let key: string;
      for (key in data) {
        if (data[key]) {
          data[key] = decodeURIComponent(data[key]);
          let div = document.createElement('div');
          div.innerHTML = data[key];
          data[key] = div.firstChild.nodeValue;
        }
      }
      return data;
    }
    else {
      return undefined;
    }
  }

  // Lets a user upload their profile to the server.
  UploadProfile(): void {
    this.requestService.post("/update/" + this.fullProfile.username, this.fullProfile, (data) => { window.location.href = 'https://aswwu.com/mask/profile/' + this.requestService.authUser.username; }, undefined);
  }
}
