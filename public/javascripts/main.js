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
    //Data is json of IDs
    window.allTags = data[0];
    window.tagRank = data[1];
    
    //Data ready

    //Render differently per page
    switch(window.location.pathname) {


      case '/': {
        for (var id in allTags) {
          if (id === "_id" || id === "thisDate") {
            if (id === "thisDate") {
              $('#date').text("Database Last Updated on " + allTags[id]);
            }
          } else {
            tableContent += '<tr>';
            tableContent += '<td>' + id + '</td>';
            tableContent += '<td>' + '<a href="' + allTags[id].html_url + '"target="_blank">' + allTags[id].title + '</a>' + '</td>';
            // If it has a rank
            if (tagRank[id]) {
              tableContent += '<td>' + tagRank[id] + '</td>';
            }else {
              tableContent += '<td sorttable_customkey="999999">N/A</td>';
            }
            // If it has a date
            if (allTags[id].date !== "N/A") {
              tableContent += '<td>' + allTags[id].date + '</td>';
            } else {
              tableContent += '<td sorttable_customkey="0000-00-00">' + allTags[id].date + '</td>';
            } 
            tableContent += '</tr>';
          }
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

          if (itemsToBeDeleted[0]) {
          // it can only pass plainobj or string as in 2nd param (data)
            $.post('/idhold/delete', {'items':JSON.stringify(itemsToBeDeleted)}, function(status) {
            /*
             * reservedList mapping :
             * 
             * reservedList = {"tagid" :"nameofthetag"}
             *
             */ 

             // gets first table
              updateReservedList(currentMongo)
            
            })
          }
          else {
            updateReservedList(currentMongo);
          }
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
          if (td1.textContent.toUpperCase().indexOf(filter) > -1 || td0.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }

        }
      }      
    });
  })

  // Enabling Entering to add tags in ID Hold
  $('#holder').keyup(function(keyTyped) {
    if(keyTyped.which == 13) {
      $('#idreserver').click();
    }
  })

  // Supporting Delete Button
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

    // checks for duplicates in the reserved list
    for (var key in reservedList) {
      if(reservedList[key] === tagNametobeInserted) {
        alert("Tag Name already exists");
        return;
      }
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

    // check for the first existing tag from the top    
    for(var i = idNumber; i > (idNumber-1000); i--) {
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
       // console.log(reservedList[key]);
        $('#tagList table tbody').html(tableContent);
      }
  }

  function updateReservedList(currentMongo) {
    for (var i = 0; i < currentMongo.length; i++) {
      reservedList[currentMongo[i].id] = currentMongo[i].name;
      tableContent += '<tr>';
      tableContent += '<td>' + currentMongo[i].id + '</td>';
      tableContent += '<td>' + currentMongo[i].name + '</td>';
      tableContent += '<td><button class="deleteButton" value='+currentMongo[i].id+'>Delete</button></td>';
      tableContent += '</tr>';
      $('#tagList table tbody').html(tableContent);
    }
  }

};

