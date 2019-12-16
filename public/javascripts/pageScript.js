let arr = [];
let markers = [];
let lastButtonClicked = '';
let row = '';
let justLoaded = true;

//Gets the table record from the server
async function initializeTable() {
	let data = await $.post("contacts/getAllRecords", $("#form_id").serialize());
	arr = data.arr;
	await initializeMap();
}

//utility function to Clear Prvious table and render new table according to arr[].
function reRenderTable() {
	console.log(arr);
	$('tbody').remove();
	for (e of arr) {
		let tr = $('<tr></tr>');
		for (property in e) {
			let td = $('<td></td>');
			td.text(e[property]);
			td.addClass('clickable_table_element');
			tr.append(td);
		}

		let td = $('<td></td>');
		let div = $('<div></div>').addClass('btn-group');
		div.attr('role', "group");
		let updateBtn = $('<button></button>').addClass('btn').addClass('btn-primary').addClass('updtButton');
		updateBtn.attr('type', 'button');
		updateBtn.attr('id', 'updtButton');
		updateBtn.text('Update');
		let deleteBtn = $('<button></button>').addClass('btn').addClass('btn-danger').addClass('delButton');
		deleteBtn.attr('type', 'button');
		deleteBtn.text('Delete');
		div.append(updateBtn);
		div.append(deleteBtn);
		td.append(div);
		tr.append(td);
		let tbody = $('<tbody></tbody>');
		tbody.append(tr);
		$('table').append(tbody);
	}
	addHandlers();

	$('#contacts_page_id').hide();
	$('#tables_page_id').show();
}

//Initialize the markers[] array and create markers and popups for the map.
async function initializeMap() {
	arr.forEach(function (item, index) {
		let lat = (item.latitude);
		let lng = (item.longitude);

		let marker = L.marker([lat, lng]).addTo(mymap);

		//Bind popup to the marker.
		let p = $('<p></p>');
		p.append((arr[index]).firstName.toUpperCase());
		p.attr('class', 'emphasis');
		marker.bindPopup(p[0]);	//add user input text to pop up.
		marker.on('mouseover', function (e) {
			this.openPopup();
		});
		marker.on('mouseout', function (e) {
			this.closePopup();
		});
		markers.push(marker);
	});
}

//Utility function that the update button 
//listner uses to change the form fields to match the selected row.
function showContactsWithInformation(row) {
	let i = 1;
	if ('Mr.' == row.eq(i).text()) {
		$("#r1").prop("checked", true);
	} else if ('Mrs.' == row.eq(i).text()) {
		$("#r2").prop("checked", true);
	} else if ('Ms.' == row.eq(i).text()) {
		$("#r3").prop("checked", true);
	} else if ('Dr.' == row.eq(i).text()) {
		$("#r4").prop("checked", true);
	}
	i++;

	$("#first_name").val(row.eq(i++).text());
	$("#last_name").val(row.eq(i++).text());
	$("#street").val(row.eq(i++).text());
	$("#city").val(row.eq(i++).text());
	$("#state").val(row.eq(i++).text());
	$("#zip").val(row.eq(i++).text());

	if (!("No" == row.eq(i).text())) {
		$("#phone").val(row.eq(i++).text());
		$("#chkbx1").prop("checked", true);
	}
	if (!("No" == row.eq(i).text())) {
		i++;
		$("#chkbx2").prop("checked", true);
	}
	if (!("No" == row.eq(i).text())) {
		$("#email").val(row.eq(i++).text());
		$("#chkbx3").prop("checked", true);
	}

	if ($("#chkbx3").is(':checked') || $("#chkbx2").is(':checked') || $("#chkbx3").is(':checked')) {
		$("#chkbx4").prop("checked", false);
	} else {
		$("#chkbx4").prop("checked", true);
	}
}

//Callback function for when "update" button is clicked
//Sends information to the server to update the record.
//Updates the row in the table.
//Removes old marker and adds new marker to the map.
//Updates arr[] and marker[] accordingly.
function updtButtonClick(e) {
	row = $(this).parents('tr').children();
	index = $('tr').index(row.parents('tr')) - 1;

	$('#contacts_page_id').show();

	showContactsWithInformation(row);
	lastButtonClicked = 'updtButton';

}

//Callback function for when "create" button is clicked
//Sends information to the server to create the record.
//Adds the row to the table.
//Adds marker to the map.
//Updates arr[] and marker[] accordingly.
function createButtonClick(e) {
	row = $(this).parents('tr').children();
	$(this).closest('form').find("input[type=text], textarea").val("");
	$('#contacts_page_id').show();
	showContactsWithInformation(row);
	lastButtonClicked = 'createButton';
}

//Callback function for when delete button is clicked
//Sends information to the server to delete the record.
//Removes the row from table.
//Removes marker from map.
//Updates arr[] and marker[] accordingly.
function deleteButtonClick(e) {
	row = $(this).parents('table tr').children();
	let id = row.first().text();
	index = $('tr').index(row.parents('tr')) - 1;
	$.post("contacts/delete", { id: id }, function (data) {
		if (data.result == 'success') {
			row.remove();
			arr.splice(index, 1);
			mymap.removeLayer(markers[index]);
			markers.splice(index, 1);
			lastButtonClicked = 'delButton';

		}
	});
}

//Callback function for when save button is clicked.
//2 Actions are available with the same button named "Save!"
//It can create a new contact or update old contact.
//Updates the table accordingly.
//Updates arr[] and marker[] accordingly.
function submitButtonClick(e) {
	$('#hiddenField').val(row.first().text());
	if ('updtButton' == lastButtonClicked) {	//Old Contact is updated
		$.post("contacts/update", $('form').serialize(), function (data) {
			index = $('tr').index(row.parents('tr')) - 1;
			arr[index] = data.obj;	//update the array
			// $('#tables_page_id').show();
			$('#contacts_page_id').hide();
			reRenderTable();
			mymap.removeLayer(markers[index]);
			let lat = (arr[index].latitude);
			let lng = (arr[index].longitude);
			let marker = L.marker([lat, lng]).addTo(mymap);
			//Bind popup to the marker.
			let p = $('<p></p>');
			p.append((arr[index]).firstName.toUpperCase());
			p.attr('class', 'emphasis');
			marker.bindPopup(p[0]);	//add user input text to pop up.
			markers[index] = marker;
			mymap.flyTo([lat, lng], 4);
			marker.on('mouseover', function (e) {
				this.openPopup();
			});
			marker.on('mouseout', function (e) {
				this.closePopup();
			});
			lastButtonClicked = "updateSubmitBtn";
		});
	} else if ('createButton' == lastButtonClicked) {	//New Contact is Created
		$.post("contacts/create", $('form').serialize(), function (data) {
			arr.push(data.obj);	//update the array
			// $('#tables_page_id').show();
			$('#contacts_page_id').hide();
			reRenderTable();
			let lat = (data.obj.latitude);
			let lng = (data.obj.longitude);
			let marker = L.marker([lat, lng]).addTo(mymap);
			//Bind popup to the marker.
			let p = $('<p></p>');
			p.append(data.obj.firstName.toUpperCase());
			p.attr('class', 'emphasis');
			marker.bindPopup(p[0]);	//add user input text to pop up.
			marker.on('mouseover', function (e) {
				this.openPopup();
			});
			marker.on('mouseout', function (e) {
				this.closePopup();
			});
			markers.push(marker);
			mymap.flyTo([lat, lng], 4);
			lastButtonClicked = "createSubmitBtn";
		});
	}
}

//Add all necessary event handlers
function addHandlers() {
	$('.updtButton').on('click', updtButtonClick);
	$('.delButton').on('click', deleteButtonClick);
	if (justLoaded) {	//don't add multiple event handlers to previous elements.
		$('.createButton').on('click', createButtonClick);
		$('.submitButton').on('click', submitButtonClick);
		justLoaded = false;
	}

	let filterTable = function () {
		var value1 = $('#search_first_name_id').val().toLowerCase();
		var value2 = $('#search_last_name_id').val().toLowerCase();


		$("tbody tr").filter(function () {

			$(this).toggle(($(this).children().eq(2).text().toLowerCase().indexOf(value1) > -1) &&
				($(this).children().eq(3).text().toLowerCase().indexOf(value2) > -1));
		});
	}
	$('#search_button_id').on('click', filterTable);
	$('.table > tbody > tr > .clickable_table_element').click(function () {
		row = $(this).parents('table tr').children();
		index = $('tr').index(row.parents('tr')) - 1;

		let lat = (arr[index].latitude);
		let lng = (arr[index].longitude);

		mymap.flyTo([lat, lng], 4);
	});

}

//
initializeTable().then(() => {
	reRenderTable();
});