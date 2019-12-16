//Create Map from Mapbox and LeafJs
L.mapbox.accessToken = 'pk.eyJ1Ijoic3JpamFuMTIxNCIsImEiOiJjazMyazBkbDAwZGIxM21sYjF6NnVqbnAxIn0.jtPTRywpGF6mJ2ZRbtWJmw';
const mymap = L.map('map_id').setView([40, -100], 3);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 20,
	id: 'mapbox.streets',
	accessToken: 'pk.eyJ1Ijoic3JpamFuMTIxNCIsImEiOiJjazMyazBkbDAwZGIxM21sYjF6NnVqbnAxIn0.jtPTRywpGF6mJ2ZRbtWJmw'
}).addTo(mymap);

//Create a 2d locations Array to store previous LatLng.
const locations = [];


//Utility function to binary search the first array cloumn of a 2d array sorted according to the first column.
//O(Log(n))
function BinarySearch2dArray(x, arr) {
	let start = 0, end = arr.length - 1;
	// Iterate while start not meets end
	while (start <= end) {
		// Find the mid index
		let mid = Math.floor((start + end) / 2);
		// If element is present at mid, return True
		if (arr[mid][0] === x[0]) return mid;
		// Else look in left or right half accordingly
		else if (arr[mid][0] < x[0])
			start = mid + 1;
		else
			end = mid - 1;
	}
	return -1;
}
//Utility function to add an element to a sorted array.
//O(n)
function add_To_Sorted_Array(element, arr) {
	if (arr.length == 0) {
		arr.push(element);
		return;
	}
	//Avoid Duplicate Latitude longitude co-ordinates
	let index = BinarySearch2dArray(element[0], arr);
	if (index != -1 && (arr[index][1] == element[1])) {
		return;
	}
	arr.push(element);
	for (let i = arr.length - 1; i > 0; i--) {
		let temp2 = (arr[i])[0];
		if (((arr[i])[0]) < ((arr[i - 1])[0])) {
			let temp = arr[i];
			arr[i] = arr[i - 1];
			arr[i - 1] = temp;
		} else {
			break;
		}
	}
	return;
}
