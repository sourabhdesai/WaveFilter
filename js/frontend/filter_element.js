// Documentation at: http://getbootstrap.com/components/#input-groups-buttons-dropdowns
// Returns a new input group to add a filter

var DEFAULT_BTN_TEXT = "Select filter";

function getButtonElement() {
	// Set up for main button
	var buttonHtml = [
		'<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false" id="filterBtn">',
			DEFAULT_BTN_TEXT + ' <span class="caret"></span>',
		'</button>'
	].join("\n");
	
	var buttonElement = $(buttonHtml);
	
	return buttonElement;
}

function getDropdownElement(onSelection, onDelete) {
	// Set up for dropdown menu
	var dropdownHtml = [
		'<ul class="dropdown-menu" role="menu">',
		'</ul>'
	].join("\n");
	var dropdownElement = $(dropdownHtml);

	// Add filters to dropdown menu and set up click handlers for each
	filterTypes.forEach(function (filterType) {
		var itemHtml = '<li><a href="#">' + filterType + '</a></li>';
		var itemElement = $(itemHtml);

		itemElement.click(function () {
			onSelection(filterType);
		});
		
		// Add dropdown item to dropdown list
		dropdownElement.append(itemElement);
	});

	var deleteItem = $('<li><a href="#">Delete</a></li>');
	deleteItem.click(onDelete);

	dropdownElement.append('<li class="divider"></li>');
	dropdownElement.append(deleteItem);

	return dropdownElement;
}

function getDropdownButton(onDelete) {
	// Holds button and dropdown in one group
	var buttonGroupHtml = [
		'<div class="input-group-btn">',
		'</div>'
	].join("\n");
	var buttonGroupElement = $(buttonGroupHtml);

	var buttonElement = getButtonElement();

	var dropdownElement = getDropdownElement(function (selection) {
		buttonElement.html(selection + ' <span class="caret"></span>');
	}, onDelete);

	// Add button and dropdown to button group
	buttonGroupElement.append(buttonElement);
	buttonGroupElement.append(dropdownElement);

	return buttonGroupElement;
}

function getInputElement() {
	// Create input field
	var inputHtml = '<input type="text" class="form-control" aria-label="..." placeholder="by..." id="filterInput">';
	var inputElement = $(inputHtml);
	return inputElement;
}

function getDeleteButtonElement() {
	var buttonHtml = [
		'<button type="button" class="btn btn-danger" aria-expanded="false">',
			'Delete',
		'</button>'
	].join("\n");

	var buttonElement = $(buttonHtml);

	return buttonElement;
}

function getNewFilterElement() {
	var html = [
		'<div class="row">',
			'<div class="col-lg-6">',
				'<div class="input-group" id="inputGroup">',
				'</div>',
			'</div>',
		'</div>'
	].join("\n");

	var filterElement = $(html);

	var dropdownButtonElement = getDropdownButton(function () {
		// On delete
		filterElement.remove();
	});
	var inputElement = getInputElement();

	var inputGroup = filterElement.find("#inputGroup");
	inputGroup.append(dropdownButtonElement);
	inputGroup.append(inputElement);

	return filterElement;
}

function getFilterInfo(filterElement) {
	var buttonElement = filterElement.find("#filterBtn");
	var inputElement = filterElement.find("#filterInput");

	// Extract filter type
	var filterType = buttonElement.text().trim();
	var filterValue = inputElement.val().trim();

	if (filterType == DEFAULT_BTN_TEXT)
		return null;
	if (filterValue == "")
		return null;

	return {
		"type": filterType,
		"value": filterValue
	};
}