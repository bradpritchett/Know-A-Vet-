
const zipSub = (e) => {
	e.preventDefault();
	let zip = document.getElementById("zipcode-entry").value;

	if (zip === "") {
		alert("You must enter your zip code to receive local results")
		return
	};

	let state = getState(zip);
	let capstate = state.code.toUpperCase();
	let fullstate = state.long;
	let svao = state.svao;
	
	vso(svao,fullstate);
	buildVa(capstate);
	buildAuntBerta(zip);
};

const vso = (svao, fullstate) => {
	var vso = document.getElementById('vso-results');
	vso.innerHTML = "";
	var vsoResults = document.createElement('div');
	vsoResults.innerHTML = `<h6>Find Veterans Service Offices in ${fullstate} </h6><p><a href="${svao}" target="_blank">${svao} <i class="fas fa-external-link-alt" aria-hidden="true"></i></p></a>`;
	vso.appendChild(vsoResults);
}

const buildAuntBerta = (zip) => {
	var ab = document.getElementsByClassName('auntbertha');
	const urls = [];
	
	for (var i = 0; i < ab.length; i++) {
		let classlist = ab[i].classList;
		const url =`https://www.auntbertha.com/search/text?term=${classlist[0]}&postal=${zip}`;
		ab[i].innerHTML = `<a href="${url}" target="_blank">Find ${classlist[0]} resources near ${zip} <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>`
		classlist.remove("auntbertha");
		classlist.add("card-text")
	}

}

const buildVa = (state) => {
	$.ajax({
		type: "GET",
		url: `https://sandbox-api.va.gov/services/va_facilities/v0/facilities?state=${state}&per_page=5`,
		headers: { apikey: "sdxDpoSvw9CDZkiOKRhKt3Y5CAeShqyy" }
	}).then(function (response) {
		console.log(response)
		processVaResponse(response, state)
	});
};

const processVaResponse = (response,state) => {
	var zip = document.getElementById('zip-results');
	zip.innerHTML = "";
	let data = response.data;
	let facilities = []
	for (var i = 0; i < data.length; i++) {
		facilities.push(data[i])
	}
	let meta = response.meta;
	let paginationInfo = meta.pagination;
	let currentPage = paginationInfo.current_page;
	let totalEntries = paginationInfo.total_entries;
	let totalPages = paginationInfo.total_pages;
	let links = response.links;
	var values = Object.entries(links);

	var resultsTable = document.createElement('table');
	var resultsTitle = resultsTable.createCaption();
	resultsTitle.innerHTML =`Found ${totalEntries} VA Facilities In ${state}`;
	var resultsTableBody = document.createElement("tbody");
	var resultsTableFoot = document.createElement("tfoot");
	var tFootTr = document.createElement('tr');

	for (var j = 0; j < values.length; j++) {
		const paginationCell = document.createElement('td');
		const paginationLinks = document.createElement('a');
		
		let text = values[j][0];
		let href = values[j][1];

		if (href === null) {
			href = '#'
		}
		paginationLinks.href = href;
		if (text === 'self') { paginationLinks.innerText = "page " + currentPage + " of " + totalPages; }
		else {
			paginationLinks.innerText = text;
		}
		paginationLinks.addEventListener("click", getLink, false);
		paginationCell.appendChild(paginationLinks);
		tFootTr.appendChild(paginationCell)
	};

	resultsTableFoot.appendChild(tFootTr);

	facilities.forEach(function (facility) {
		let website = facility.attributes.website;
		let address2 = facility.attributes.address.physical.address_2;
		let facility_type = facility.attributes.facility_type;
		let name = facility.attributes.name;
		if (website !== null) {
			name = `<a href="${facility.attributes.website}" target="_blank">${facility.attributes.name} <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>`;
		}

		if (address2 === null) {
			address2 = ""
		}
		
		var tr = document.createElement('tr');
		tr.innerHTML  = `<td colspan="2">` + name + `<br />` + facility.attributes.phone.main +`</td><td colspan="2">` + facility.attributes.address.physical.address_1 +`<br />`+ address2 +`<br />`+facility.attributes.address.physical.city+`, `+facility.attributes.address.physical.state+` `+facility.attributes.address.physical.zip + `</td>`;
		resultsTableBody.appendChild(tr);
	});

	resultsTable.appendChild(resultsTableBody);
	resultsTable.appendChild(resultsTableFoot);
	zip.appendChild(resultsTable);
};

const getLink = (e) => {
	e.preventDefault();
	let link = e.srcElement.attributes.href.value;
	if (link === '#') {
		e.preventDefault();
		return;
	}
	var chunk = link.substring(
		link.lastIndexOf("state="), 
		link.lastIndexOf("&page")
	);
	var statechunk = chunk.split("=");
	var state = statechunk[1];

	$.ajax({
			type: "GET",
			url: link,
			headers: { apikey: "sdxDpoSvw9CDZkiOKRhKt3Y5CAeShqyy" },
		}).then(function (response) {
			processVaResponse(response,state)
		});
};

const getState = (zip) => {
	var states = [
		{ min: 35000, max: 36999, code: "AL", long: "Alabama", svao: "https://va.alabama.gov/serviceofficer/" },
		{ min: 99500, max: 99999, code: "AK", long: "Alaska", svao: "http://veterans.alaska.gov/VSO" },
		{ min: 85000, max: 86999, code: "AZ", long: "Arizona", svao: "https://dvs.az.gov/contact-us" },
		{ min: 71600, max: 72999, code: "AR", long: "Arkansas", svao: "http://www.veterans.arkansas.gov/benefits" },
		{ min: 90000, max: 96699, code: "CA", long: "California", svao: "https://www.calvet.ca.gov/VetServices/pages/cvso-locations.aspx" },
		{ min: 80000, max: 81999, code: "CO", long: "Colorado", svao: "https://www.colorado.gov/pacific/vets/county-veterans-service-offices" },
		{ min: 6000, max: 6999, code: "CT", long: "Connecticut", svao: "https://portal.ct.gov/DVA/Pages/Office-of-Advocacy-and-Assistance/Contact" },
		{ min: 19700, max: 19999, code: "DE", long: "Deleware", svao: "https://vets.delaware.gov/service-officers/" },
		{ min: 32000, max: 34999, code: "FL", long: "Florida", svao: "https://floridavets.org/benefits-services/" },
		{ min: 30000, max: 31999, code: "GA", long: "Georgia", svao: "https://veterans.georgia.gov/services/benefits-assistance" },
		{ min: 96700, max: 96999, code: "HI", long: "Hawaii", svao: "http://dod.hawaii.gov/ovs/contact/" },
		{ min: 83200, max: 83999, code: "ID", long: "Idaho", svao: "http://www.veterans.idaho.gov/service-officers" },
		{ min: 60000, max: 62999, code: "IL", long: "Illinois", svao: "https://www2.illinois.gov/veterans/benefits/Pages/benefits-assistance.aspx" },
		{ min: 46000, max: 47999, code: "IN", long: "Indiana", svao: "https://www.in.gov/dva/2370.htm" },
		{ min: 50000, max: 52999, code: "IA", long: "Iowa", svao: "https://va.iowa.gov/counties" },
		{ min: 66000, max: 67999, code: "KS", long: "Kansas", svao: "https://kcva.ks.gov/veteran-services/office-locations" },
		{ min: 40000, max: 42999, code: "KY", long: "Kentucky", svao: "https://veterans.ky.gov/Benefits/fieldreps/Pages/default.aspx" },
		{ min: 70000, max: 71599, code: "LA", long: "Louisiana", svao: "https://www.vetaffairs.la.gov/locations/" },
		{ min: 3900, max: 4999, code: "ME", long: "Maine",svao: "https://www.maine.gov/veterans/" },
		{ min: 20600, max: 21999, code: "MD", long: "Maryland", svao: "https://veterans.maryland.gov/maryland-department-of-veterans-affairs-service-benefits-program/" },
		{ min: 1000, max: 2799, code: "MA", long: "Massachusetts", svao: "https://massvetsadvisor.org/" },
		{ min: 48000, max: 49999, code: "MI", long: "Michigan", svao: "https://www.michiganveterans.com/find-benefits-counselor" },
		{ min: 55000, max: 56999, code: "MN", long: "Minnesota", svao: "https://www.macvso.org/find-a-cvso.html" },
		{ min: 38600, max: 39999, code: "MS", long: "Mississippi", svao: "https://www.msva.ms.gov/serviceofficers" },
		{ min: 63000, max: 65999, code: "MO", long: "Missouri", svao: "https://mvc.dps.mo.gov/service/serviceofficer/" },
		{ min: 59000, max: 59999, code: "MT", long: "Montana", svao: "http://montanadma.org/montana-veterans-affairs" },
		{ min: 27000, max: 28999, code: "NC", long: "North Carolina", svao: "http://www.nc4vets.com/service-locator" },
		{ min: 58000, max: 58999, code: "ND", long: "North Dakota", svao: "http://www.nd.gov/veterans/service-officers" },
		{ min: 68000, max: 69999, code: "NE", long: "Nebraska", svao: "http://www.vets.state.ne.us/cvso.html" },
		{ min: 88900, max: 89999, code: "NV", long: "Nevada", svao: "http://veterans.nv.gov/benefits-and-services/veterans-service-officers/" },
		{ min: 3000, max: 3899, code: "NH", long: "New Hampshire", svao: "http://www.nh.gov/nhveterans/visitation/index.htm" },
		{ min: 7000, max: 8999, code: "NJ", long: "New Jersey", svao: "http://www.state.nj.us/military/veterans/programs.html" },
		{ min: 87000, max: 88499, code: "NM", long: "New Mexico", svao: "http://www.nmdvs.org/field-offices/" },
		{ min: 10000, max: 14999, code: "NY", long: "New York" , svao: "http://www.veterans.ny.gov/content/starting-claim"},
		{ min: 43000, max: 45999, code: "OH", long: "Ohio", svao: "https://dvs.ohio.gov/wps/portal/gov/dvs/what-we-do/find-a-cvso/" },
		{ min: 73000, max: 74999, code: "OK", long: "Oklahoma", svao: "https://okvets.ok.gov/find-a-service-officer/" },
		{ min: 97000, max: 97999, code: "OR", long: "Oregon", svao: "http://www.oregon.gov/odva/VSODIRECT/pages/locator.aspx" },
		{ min: 15000, max: 19699, code: "PA", long: "Pennsylvania", svao: "http://www.dmva.pa.gov/veteransaffairs/Pages/Outreach-and-Reintegration/County-Directors.aspx" },
		{ min: 300, max: 999, code: "PR", long: "Puerto Rico", svao: "https://www.benefits.va.gov/SanJuan/veterans-services-orgs.asp" },
		{ min: 2800, max: 2999, code: "RI", long: "Rhode Island", svao: "http://www.vets.ri.gov/contact/" },
		{ min: 29000, max: 29999, code: "SC", long: "South Carolina", svao: "https://scdva.sc.gov/claims-assistance" },
		{ min: 57000, max: 57999, code: "SD", long: "South Dakota", svao: "http://vetaffairs.sd.gov/veteransserviceofficers/locatevso.aspx" },
		{ min: 37000, max: 38599, code: "TN", long: "Tennessee", svao: "https://www.tn.gov/veteran/contact-us/state-veterans-services-offices.html" },
		{ min: 75000, max: 79999, code: "TX", long: "Texas", svao: "https://www.texvet.org/va-claims-assistance" },
		{ min: 88500, max: 88599, code: "TX", long: "Texas", svao: "https://www.texvet.org/va-claims-assistance" },
		{ min: 84000, max: 84999, code: "UT", long: "Utah", svao: "http://veterans.utah.gov/va-benefits-claims-assistance/" },
		{ min: 5000, max: 5999, code: "VT", long: "Vermont", svao: "http://veterans.vermont.gov/special/vso" },
		{ min: 22000, max: 24699, code: "VA", long: "Virgina", svao: "https://www.dvs.virginia.gov/dvs/locations" },
		{ min: 20000, max: 20599, code: "DC", long: "Washington DC", svao: "https://www.dvs.virginia.gov/dvs/locations" },
		{ min: 98000, max: 99499, code: "WA", long: "Washington", svao: "https://www.dva.wa.gov/resources/county-map" },
		{ min: 24700, max: 26999, code: "WV", long: "West Virginia", svao: "http://www.veterans.wv.gov/field-office/Pages/default.aspx" },
		{ min: 53000, max: 54999, code: "WI", long: "Wisconsin", svao: "http://wicvso.org/locate-your-cvso/" },
		{ min: 82000, max: 83199, code: "WY", long: "Wyoming", svao: "http://wyomilitary.wyo.gov/veterans/service-officers/" },
	];

	var state = states.filter(function (s) {
		return s.min <= zip && s.max >= zip;
	});

	if (state.length == 0) {
		return false;
	} else if (state.length > 1) {
		console.error("Whoops found two states");
	}
	return { code: state[0].code, long: state[0].long, svao: state[0].svao };
};
