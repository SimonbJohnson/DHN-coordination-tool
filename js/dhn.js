function drawCloud(words){

    var maxCount = d3.max(words,function(d){return d.size});
    var layout = d3.layout.cloud()
        .size([$('#searchcloud').width(), 300 ])
        .words(words)
        .padding(5)
        .rotate(0)
        .font("Arial")
        .fontSize(function(d) { return 10+d.size/maxCount*40; })
        .on("end", draw);


    layout.start();

    function draw(words) {
        d3.select("#searchcloud").append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
        .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Arial")
          .style("fill", "#B3130B")
          .attr("class","cloudterm")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; })
          .on("click",function(d){
            $('#searchbox').val(d.text);
            search(d.text);
          });
    }

}




function resultsHTML(result){
    var html = '<div class="resultitem">';
    if(result['#meta+url']!=''){
        html +='<h3 class="title"><a href="'+result['#meta+url']+'" target="_blank">'+result['#meta+title']+'</a></h3><span class="sub">'+result['#meta+category']+'</span>';
    } else {
        html +='<h3 class="title">'+result['#meta+title']+'</h3><span class="sub">'+result['#meta+category']+'</span>';
    }
    html+='<p>'+result['#meta+description']+'</p><p>';
    if(result['#contact+name']!=''){
        html+=result['#contact+name']+', ';
    }
    html+=result['#org']+'</p></div>';
    return html;
}

function searchResults(query){
    var results = [];
    dataHXL.forEach(function(d){
        d['#meta+tags'].split(",").forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            if(query.toLowerCase()==e.toLowerCase()){
                results.push(d);
            };
        });
        if(query.toLowerCase()==d['#meta+title'].toLowerCase()){
            results.push(d);
        };
        if(query.toLowerCase()==d['#org'].toLowerCase()){
            results.push(d);
        };
        if(query.toLowerCase()==d['#contact+name'].toLowerCase()){
            results.push(d);
        };                        
    });
    var html = '<p>Contact the DHN coordinator for more details on anything listed below</p>';
    results.forEach(function(r){
        html+=resultsHTML(r);
    })
    $('#results').html(html);   
}

//compile search results

function search(query){
    $('#searchbox').blur();
    $('#searchcloud').slideUp();
    var html = '<p>Contact the DHN coordinator for more details on anything listed below</p>';
    html = searchResults(query);
    $('#results').html(html);    
}

function updateAutoComplete(list){
    $( "#searchbox" ).autocomplete({
      source: list,
      minLength: 2,
      select: function(event, ui) {
            search(ui.item.value); }
    });       
}

function compileSearchList(data){
    var searchTerms = [];
    data.forEach(function(d){
        d['#meta+tags'].split(",").forEach(function(e){
            if(e.substring(0,1)===" "){
                e=e.substring(1);
            }
            searchTerms.push(e.toLowerCase());
        });
        searchTerms.push(d['#meta+title'].toLowerCase());
        searchTerms.push(d['#org'].toLowerCase());
        searchTerms.push(d['#contact+name'].toLowerCase());
    });
    return searchTerms;
}

function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            keys = e;
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

//function to construct hxlprxy URL

function constructHXLURL(linkList){
    var url = 'http://beta.proxy.hxlstandard.org/data.json?filter_count=7&url=';
    linkList.forEach(function(l,i){
        if(i==0){
            url+=l+'&strip-headers=on&format=html';
        }
        if(i==1){
            url+='&filter01=append&append-dataset01-01='+l;
        }
        if(i>1){
            url+='&append-dataset01-0'+i+'='+l;
        }
    });
    return url;
}

//function to remove duplicated from seacrch term lists

function removeDuplicatesSort(list){
    return list.filter(function(item, pos, self) {
        return self.indexOf(item) === pos;
    }).sort();    
}

function removeDuplicatesCountSort(list){
    var newList = [];
    list.forEach(function(t){
        if(t!=''){
            var found=false;
            newList.forEach(function(e){
                if(e.text==t){
                    found=true;
                    e.size+=1;
                }
            })
            if(!found){
                newList.push({'text':t,'size':1})
            }
        }
    });
    return newList;
}

var dataHXL;

$('#configtitle').html(config.title);
$('#configsubtitle').html(config.subtitle);
$('#configdatalink').attr('href',config.datalink);
$('#configspreadsheetlink').attr('href',config.spreadsheetlink);

$('#searchbox').keypress(function (e) {
    if (e.which === 13) {
        search($('#searchbox').val());
    }
});

$('#searchbox').on('focus',function(){  
        $('#searchcloud').slideDown();
})

$.ajax(constructHXLURL(sheets), {
        success: function(data) {
            dataHXL = hxlProxyToJSON(data);
            var searchList = compileSearchList(dataHXL);
            drawCloud(removeDuplicatesCountSort(searchList));
            updateAutoComplete(removeDuplicatesSort(searchList));
        },
        error: function(e,err) {
            console.log(err);
        }
});

