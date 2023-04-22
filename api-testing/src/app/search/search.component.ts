import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {
  location: string = "";
  restaurants: any[] = [];
  likedRestaurants: any[] = [];
  currentRestaurantIndex: number = 0;

  async onSubmit() {

    // Get lat & long of entered location
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${this.location}&format=json&limit=1`;
    const nominatimResponse = await axios.get(nominatimUrl);
    const userLatitude = nominatimResponse.data[0].lat;
    const userLongitude = nominatimResponse.data[0].lon;

    // Searching for restaurants 10 mi in radius
    const radiusInMeters = 16093.4; // 10 miles in meters
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="restaurant"](around:${radiusInMeters},${userLatitude},${userLongitude});out;`;
    const overpassResponse = await axios.get(overpassUrl);
    const restaurants = overpassResponse.data.elements;

    // Add restaurants to the restaurant array
    for (const restaurant of restaurants) {
      const restaurantLatitude = restaurant.lat;
      const restaurantLongitude = restaurant.lon;
      const restaurantName = restaurant.tags.name;
      const restaurantAddress = `${restaurant.tags['addr:housenumber']} ${restaurant.tags['addr:street']}, ${restaurant.tags['addr:city']}, ${restaurant.tags['addr:postcode']}`;
      const restaurantCuisineType = restaurant.tags.cuisine;
      const distance = this.getDistance(userLatitude, userLongitude, restaurantLatitude, restaurantLongitude);
      if (distance <= 10) {
        this.restaurants.push({
          name: restaurantName,
          address: restaurantAddress,
          cuisineType: restaurantCuisineType,
          distance: distance.toFixed(2)
        });
      }
    }
  }

  // Executes when a "swipe" is made, adds liked restaurants to likedRestaurants array
  likeRestaurant(liked: boolean) {
    if (liked) {
      this.likedRestaurants.push({
        name: this.restaurants[this.currentRestaurantIndex].name,
        address: this.restaurants[this.currentRestaurantIndex].address,
        cuisineType: this.restaurants[this.currentRestaurantIndex].cuisineType,
        distance: this.restaurants[this.currentRestaurantIndex].distance
      });
    }
    this.currentRestaurantIndex++;
  }

  // Define a function to calculate the distance between two latitude and longitude coordinates
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c / 1.609; // Distance in miles
    return distance;
  }

  // Define a function to convert degrees to radians
  toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}