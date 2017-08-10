$(document).ready(function() {
  //Display tag table with filter handler
  //set active
  $('a[href="' + this.location.pathname + '"]').parents('li,ul').addClass('active');
  displayTags();


});



function displayTags() {

  // Empty content string
  var tableContent = '';
  var tagNametobeInserted = '';
  var idNumber = '';
  var reservedList = {};


  $.getJSON('/taglist/tags', function(data) {
    data = data.replace(/\\n/g, "\\n")
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, "\\&")
      .replace(/\\r/g, "\\r")
      .replace(/\\t/g, "\\t")
      .replace(/\\b/g, "\\b")
      .replace(/\\f/g, "\\f");
    // remove non-printable and other non-valid JSON chars
    data = data.replace(/[\u0000-\u0019]+/g, "");
    window.allTags = JSON.parse(data).manageList;
    //Data ready

    //Render differently per page
    switch(window.location.pathname) {


      case '/': {
        for (var id in allTags) {
          tableContent += '<tr>';
          tableContent += '<td>' + id + '</td>';
          tableContent += '<td>' + allTags[id].title + '</td>';
          tableContent += '<td>' + "?" + '</td>';
          tableContent += '</tr>';
        }
      }
      break;

      case '/top50':{
        //Top 50 tags taken from Ty's reports
        window.topTagsIDs = [7110, 20010, 6026, 20067, 7117, 4001, 20064, 2045, 7115, 20011, 7129, 7001, 19063, 3108, 20078, 3015, 19004, 25016, 8009, 1066, 17001, 3004, 15022, 20103, 6011, 7050, 11003, 13051, 6020, 1068, 13055, 2013, 17009, 16044, 1191, 13032, 12015, 20052, 7127, 18016, 7125, 13002, 22017, 1157, 23001, '7114.standard', 3005, 20040, 13060, 20087];
        window.topTagsInfo = {};
        for (i = 0; i < topTagsIDs.length; i++) {
          (function(x){

           $.get('/top50/dates?id=' + topTagsIDs[x], function(res) {
              topTagsInfo[topTagsIDs[x]] = res[topTagsIDs[x]];
              tableContent += '<tr>';
              tableContent += '<td>' + topTagsIDs[x] + '</td>';
              //Tag 7114 has a custom name
              if (topTagsIDs[x] === '7114.standard') {
                tableContent += '<td>' + allTags[7114].title + '</td>';
              } else {
                tableContent += '<td>' + allTags[topTagsIDs[x]].title + '</td>';
              }
              var date = topTagsInfo[topTagsIDs[x]].split('-', 2).reverse().join('-')

              tableContent += '<td>' + date; + '</td>';
              tableContent += '</tr>';
              $('#tagList table tbody').html(tableContent);
           });
          })(i)
        }
      }
      break;

      case '/idhold':{

       $.get('/idhold/read', function(res) {
          // Current Mongo Array
          var currentMongo = res;
          var itemsToBeDeleted = [];

          // current Mongo Array gets duplicate deletes
          // also the duplicates will be inserted to itemsToBeDeleted          
          for (var j = 0; j < currentMongo.length; j++) {
            if(allTags[currentMongo[j].id]) {
              itemsToBeDeleted.push(currentMongo[j].id);
              currentMongo.splice(j, 1);
              j--;
            }
          }


          // it can only pass plainobj or string as in 2nd param (data)
          $.post('/idhold/delete', {'items':JSON.stringify(itemsToBeDeleted)}, function(status) {
           
            /*
             * reservedList mapping :
             * 
             * reservedList = {"tagid" :"nameofthetag"}
             *
             */ 


             // gets first table
            for (var i = 0; i < currentMongo.length; i++) {
              reservedList[currentMongo[i].id] = currentMongo[i].name;
              tableContent += '<tr>';
              tableContent += '<td>' + currentMongo[i].id + '</td>';
              tableContent += '<td>' + currentMongo[i].name + '</td>';
              tableContent += '<td><button class="deleteButton" value='+currentMongo[i].id+'>Delete</button></td>';
              tableContent += '</tr>';
              $('#tagList table tbody').html(tableContent);
            }
          })

        });
      }
      break;

      default:
      break;
    }




    // Inject the whole content string into our existing HTML table
    $('#tagList table tbody').html(tableContent);

    $('#filter').keyup(function() {

      var input, filter, table, tr, td, i;
      input = document.getElementById("filter");
      filter = input.value.toUpperCase();
      table = document.getElementById("tagList");
      tr = table.getElementsByTagName("tr");

      for (i = 0; i < tr.length; i++) {
        td0 = tr[i].getElementsByTagName("td")[0];
        td1 = tr[i].getElementsByTagName("td")[1];
        if (td1) {
          if (td1.innerHTML.toUpperCase().indexOf(filter) > -1 || td0.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }

        }
      }      
    });
  })

  $( "body" ).on( "click", "button.deleteButton", function() {
    
    var idToBeErased = this.value;

    $.post('/idhold/delete', {'id':idToBeErased}, function(){
      updateList(reservedList, {'id':idToBeErased}, "delete", function(){

      });
    })
  });


  // triggers an event when the button is clicked
  $('#idreserver').click(function() {
    // idNumber would have the appropriate tag ID.
    var holder = document.getElementById("holder"); 
    tagNametobeInserted = holder.value;

    if (tagNametobeInserted === "") {
      alert("Please Type Tag Name to Add Tags");
      return;
    }
   
    if (reservedList[tagNametobeInserted]) {
      alert("Tag Name already exists");
      return;
    }
    // get the first alphabet
    idNumber = tagNametobeInserted[0].toUpperCase(); 
    idNumber = idNumber.charCodeAt(0);


    // catch non-alphabets
    if (idNumber > 64 && idNumber < 91) {
      idNumber = (idNumber-63)*1000;
    }
    else {
      idNumber = 28000;
   }



    for(var i = idNumber; i > (idNumber-1000); i--) {
      // check for the first existing tag from the top 
      if(allTags[i]) {
        i++;
        idNumber = i;
        break;
      }
    }
    // post the data
    $.post('/idhold/insert', {'id':idNumber.toString(), 'name':tagNametobeInserted}, function(result) {
          updateList(reservedList, {'id':result.id, 'name':result.name}, "insert", function(){
          });
    });

  })


  // use this updateList func to update the table after inserting or deleting data
  function updateList(reservedList, data, identifier) {

    // empty the table
    tableContent = '';
    $('#tagList table tbody').html(tableContent);

      if (identifier === "delete") {
        var id = data.id;
        delete reservedList[id];
      }
      if (identifier === "insert") {
        reservedList[data.id] = data.name;
      }
      
      // refresh to new table
      for (var key in reservedList) {
        tableContent += '<tr>';
        tableContent += '<td>' + key + '</td>';
        tableContent += '<td>' + reservedList[key] + '</td>';
        tableContent += '<td><button class="deleteButton" value='+key+'>Delete</button></td>';
        tableContent += '</tr>';
        console.log(reservedList[key]);
        $('#tagList table tbody').html(tableContent);
      }
  }

};

