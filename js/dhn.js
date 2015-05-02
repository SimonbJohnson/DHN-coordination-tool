var R2WData = {};
var gtags=[];
var gdescriptions=[];
var gnames=[];
var gorgs=[];

function sheetLoaded(spreadsheetData) {
    console.log(spreadsheetData);
    R2WData = spreadsheetData;
    initR2WSearch(spreadsheetData);
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

function initR2WSearch(spreadsheetData){
    var resultslist = compileR2WSearchList(spreadsheetData.feed.entry);

    gtags = gtags.concat(resultslist[0]);
    gdescription = gdescriptions.concat(resultslist[1]);
    gnames = gnames.concat(resultslist[2]);
    gorgs = gorgs.concat(resultslist[3]);
    
    var list = removeDuplicates(concatLists(gtags,gdescriptions,gnames,gorgs));
    $( "#searchbox" ).autocomplete({
      source: list
    });    
}

function search(query){
    $('#results').html(getr2whtml(query,R2WData.feed.entry));    
}

function removeDuplicates(list){
    return list.filter(function(item, pos, self) {
        return self.indexOf(item) === pos;
    });    
}

function concatLists(tags, descriptions, names, orgs){
    return tags.concat(descriptions.concat(names.concat(orgs)));
}

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
        html = '<p>Contact the DHN coordinator for more details on anything listed below</p><div class="sectionTitle"><h2>Remote Who is Doing What</h2></div>';
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

$('#searchbox').keypress(function (e) {
    if (e.which === 13) {
        search($('#searchbox').val());
    }
});