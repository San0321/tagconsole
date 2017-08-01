$(document).ready(function() {
  //Display tag table with filter handler
  //set active
  $('a[href="' + this.location.pathname + '"]').parents('li,ul').addClass('active');
  displayTags();
});


function displayTags() {

  // Empty content string
  var tableContent = '';

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

};