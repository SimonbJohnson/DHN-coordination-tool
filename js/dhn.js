//spreadsheet columns to search
var skypeFields = [{name:"description",priority:"low"},
                    {name:"name",priority:"medium"}];
var r2wFields = [
                    {name:"description",priority:"low"},
                    {name:"name",priority:"low"},
                    {name:"organisation",priority:"medium"}
                ];                

// initialise variable to store the spreadsheet data

var R2WData = {};
var skypeData = {};

// variable to store terms for searching
// multiple spreadsheet add to this

var autoCompleteList = {
    high:[],
    medium:[],
    low:[] 
};

function compileSearchList(entries,fields){
    
    var list = {
        high:[],
        medium:[],
        low:[] 
    };

    entries.forEach(function(e){
        var tagslist = e.gsx$tags.$t.split(",");
        tagslist.forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            list.high.push(e.toLowerCase());
        });
        fields.forEach(function(f){
            list[f.priority].push(e["gsx$"+f.name].$t.toLowerCase());
        });
    });
    autoCompleteList.high = autoCompleteList.high.concat(list.high);
    autoCompleteList.medium = autoCompleteList.medium.concat(list.medium);
    autoCompleteList.low = autoCompleteList.low.concat(list.low);  
}

// remote 2w functionality

/// creates list of all the search terms
/// separated into independent lists to prioritise appearance in search box
//  e.g. tags suggested before names

function initR2W(spreadsheetData){
    
    R2WData = spreadsheetData;
    compileSearchList(R2WData.feed.entry,r2wFields);   
    updateAutoComplete();
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
    compileSearchList(skypeData.feed.entry,skypeFields);    
    updateAutoComplete();  
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

// update automcomplete

function updateAutoComplete(){
    var list = removeDuplicates(concatLists(autoCompleteList.high,autoCompleteList.medium,autoCompleteList.low));
    $( "#searchbox" ).autocomplete({
      source: list,
      minLength: 2
    });       
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

function concatLists(high, medium, low){
    return high.concat(medium.concat(low));
}

$('#searchbox').keypress(function (e) {
    if (e.which === 13) {
        search($('#searchbox').val());
    }
});