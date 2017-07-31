$(document).ready(function() {
  //Display tag table with filter handler
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
    window.myTags = JSON.parse(data).manageList;
    //Data ready

    for (var id in myTags) {
      tableContent += '<tr>';
      tableContent += '<td>' + id + '</td>';
      tableContent += '<td>' + myTags[id].title + '</td>';
      tableContent += '</tr>';
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