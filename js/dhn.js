// initialise variable to store the spreadsheet data

var R2WData = {};
var skypeData = {};

// variable to store terms for searching
// multiple spreadsheet add to this

var gtags=[];
var gdescriptions=[];
var gnames=[];
var gorgs=[];

// remote 2w functionality

/// creates list of all the search terms
/// separated into independent lists to prioritise appearance in search box
//  e.g. tags suggested before names

function initR2W(spreadsheetData){
    
    R2WData = spreadsheetData;
    
    var resultslist = compileR2WSearchList(spreadsheetData.feed.entry);

    gtags = gtags.concat(resultslist[0]);
    gdescription = gdescriptions.concat(resultslist[1]);
    gnames = gnames.concat(resultslist[2]);
    gorgs = gorgs.concat(resultslist[3]);
    
    var list = removeDuplicates(concatLists(gtags,gdescriptions,gnames,gorgs));
    $( "#searchbox" ).autocomplete({
      source: list,
      minLength: 2
    });    
}

function compileR2WSearchList(entries){
    var tags=[];
    var descriptions=[];
    var names=[];
    var orgs=[];
    entries.forEach(function(e){
        var tagslist = e.gsx$tags.$t.split(",");
        tagslist.forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            tags.push(e.toLowerCase());
        });
        descriptions.push(e.gsx$description.$t.toLowerCase());
        names.push(e.gsx$name.$t.toLowerCase());
        orgs.push(e.gsx$organisation.$t.toLowerCase());
    });
    return [tags, descriptions, names, orgs];
}

// spreadsheet loaded in parallel so search lists added to overall lists
// and autocomplete reset.

function getr2whtml(query,entries){
    var tags=[];
    var descriptions=[];
    var names=[];
    var orgs=[];

    entries.forEach(function(e,index){
        var tagslist = e.gsx$tags.$t.split(",");
        tagslist.forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            if(e.toLowerCase()===query){
                tags.push(index);
            }
        });
        if(query === e.gsx$description.$t.toLowerCase()){
            descriptions.push(index);
        }
        if(query === e.gsx$name.$t.toLowerCase()){
            names.push(index);
        }
        if(query === e.gsx$organisation.$t.toLowerCase()){
            orgs.push(index);
        }
    });
    
    var compiledList = tags.concat(descriptions.concat(names).concat(orgs));
    compiledList = compiledList.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });
    
    var html ="";
    if(compiledList.length>0){
        html = '<div class="sectionTitle"><h2>Remote Who is Doing What</h2></div>';
        compiledList.forEach(function(e){
            html += '<div class="resultitem">';
            if(entries[e].gsx$relevantlink.$t!==""){
                html +='<h4><a href="'+entries[e].gsx$relevantlink.$t+'" target="_blank">' + entries[e].gsx$description.$t + '</a></h4>';
            } else {
                html +="<h4>" + entries[e].gsx$description.$t + "</h4>";
            }
            
            html +="<p>" + entries[e].gsx$organisation.$t + " - " + entries[e].gsx$name.$t +"</p>";
            html+='</div>';
        });
    }
    return html;
}

// compiling skype rooms

function initSkypeRooms(spreadSheetData){

    skypeData = spreadSheetData;
    
    var resultslist = compileSkypeRoomSearchList(spreadSheetData.feed.entry);

    gtags = gtags.concat(resultslist[0]);
    gdescription = gdescriptions.concat(resultslist[1]);
    gnames = gnames.concat(resultslist[2]);
    
    var list = removeDuplicates(concatLists(gtags,gdescriptions,gnames,gorgs));
    $( "#searchbox" ).autocomplete({
      source: list,
      minLength: 2
    });      
    
}

function compileSkypeRoomSearchList(entries){
    var tags=[];
    var descriptions=[];
    var names=[];
    console.log(entries);
    entries.forEach(function(e){
        var tagslist = e.gsx$tags.$t.split(",");
        tagslist.forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            tags.push(e.toLowerCase());
        });
        descriptions.push(e.gsx$description.$t.toLowerCase());
        names.push(e.gsx$name.$t.toLowerCase());
    });
    return [tags, descriptions, names];    
}

function getSkypeRoomshtml(query,entries){
    var tags=[];
    var descriptions=[];
    var names=[];

    entries.forEach(function(e,index){
        var tagslist = e.gsx$tags.$t.split(",");
        tagslist.forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            if(e.toLowerCase()===query){
                tags.push(index);
            }
        });
        if(query === e.gsx$description.$t.toLowerCase()){
            descriptions.push(index);
        }
        if(query === e.gsx$name.$t.toLowerCase()){
            names.push(index);
        }
    });
    
    var compiledList = tags.concat(descriptions.concat(names));
    compiledList = compiledList.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });
    
    var html ="";
    if(compiledList.length>0){
        html = '<div class="sectionTitle"><h2>Skype Rooms</h2></div>';
        compiledList.forEach(function(e){
            html += '<div class="resultitem">';
            html +='<h4>' + entries[e].gsx$name.$t + '</h4>';
            html +='<p>' + entries[e].gsx$description.$t + '</p>';
            html+='</div>';
        });
    }
    return html;
}

//compile search results

function search(query){
    var html = '<p>Contact the DHN coordinator for more details on anything listed below</p>';
    html = html + getSkypeRoomshtml(query,skypeData.feed.entry);
    html = html + getr2whtml(query,R2WData.feed.entry);
    $('#results').html(html);    
}

//function to remove duplicated from seacrch term lists

function removeDuplicates(list){
    return list.filter(function(item, pos, self) {
        return self.indexOf(item) === pos;
    });    
}

// function to concatenate lists

function concatLists(tags, descriptions, names, orgs){
    return tags.concat(descriptions.concat(names.concat(orgs)));
}

$('#searchbox').keypress(function (e) {
    if (e.which === 13) {
        search($('#searchbox').val());
    }
});