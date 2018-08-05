/**
 * Use this in the Details page : this function will return the Id of the current detail page (expl : for Program details it will return the Id of the current program)
 * you can use it with URL with this form : /blablabla/.../blalala/{ID}
 */
function getDetailId()
{
    Path = $(location).attr('href').split('/')
   return Path[Path.length - 1]
}

function copyText(inputId) {
    var copyText = document.getElementById(inputId);
    copyText.select();
    document.execCommand("copy");
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}
/**
 * InitializeSelection() : call this function everytime you have a dataTable and you want to use the function DeleteItems, it will make the row of the table clickable
 * add the class .delete-selection to the button so the function can work propely : the button is disabled while the user didn't select a row
 */
function initializeSelection() {
    $('tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
        var test = $(this).parent().find(".selected")
        if (test.length > 0)
            $(this).closest("div .portlet").find(".delete-selection").removeAttr("disabled")
        else
            $(this).closest("div .portlet").find(".delete-selection").attr('disabled', 'disabled')
    })
    $("body").click(
        function (e) {
            if ($(e.target).prop("tagName") !== "TD" && !$(e.target).hasClass("table-menu")) {
                $("tr").removeClass('selected');
                $(".delete-selection").attr('disabled', 'disabled');
            }
        }
    );
}

function getDataOnDoubleClick(table, baseURL, row)
{
    var selectedTableId = $(table).context[0].sTableId
    if (baseURL.slice(-1) != "/") baseURL += "/" + row.id
        else baseURL += row.id
        data = ajax("", baseURL, "GET")
        baseURL = baseURL.slice(0, -1)
    return data
}

function activateAutoSubmit()
{
    $('form').submit(function (e) {
        e.preventDefault();
    });
}

/**
 * Call this function whenever you want to delete the selected items from the dataTable, it will get the Id of each row and create an array of Ids then it will call ajax(data, url, method) which will send a
 * request to the indicated URL and delete the records with the given Ids
 * @param {DataTable} table
 * @param {String} url
 */
function deleteItems(table, url) {
    var selectedTableId = $(table).context[0].sTableId
  
    var data = "[";
    var trs = $('#' + selectedTableId + ' tr.selected')
  
    if (trs.length > 0)
    {
        for (i = 0; i < trs.length; i++)
            data += trs[i].id + ","

        data = data.slice(0, -1)
        data += "]"

        $('#' + selectedTableId + ' tr.selected').remove()
     
        return ajax(data, url, "POST")
    }
}

/**
 * You can use this function whenever you want to make an ajax request to the server, it will return an ajax response, you can use it success, error... functions to display a feedback for the user
 * NOTE : If the data is null or an empty string the function will consider that you are sending an Id or something in the URL, Example : /products/get/1
 * @param {The data you want to send} data
 * @param {String : the target url} url
 * @param {The method : GET/POST...} method
 */
function ajax(data, url, method) {
    if (data !== null && data !== "")
        return $.ajax({
            type: method,
            url: url,
            data: "req=" + data
        });
    else
        return $.ajax({
            type: method,
            url: url
        });
}
/**
 * Use this function whenever you want to make an autoSubmit with ajax call, send the clicked button as param, it will detect the form
 * which the id must be buttonId+'-form' and it will get it action/method and data and send them automatically then return the response
 * @param {any} button
 */
function autoSubmit(button)
{
    var frm = $('#' + button.id + '-form')
     return   $.ajax({
                    type: frm.attr('method'),
                    url: frm.attr('action'),
                    data: frm.serialize()
                });
}

/**
 * Whenever you want to add a new dataTable, just use this function, it will return a DataTable object, stock it in a variable to use it whenever you want to get informations from the table
 * @param {the id of the table that you want to make it a DataTable} id
 * @param {The columnDefs of the DataTable} columnDefs
 * @param {The URL from where you want to populate the DataTable} url
 * @param {The column Id of the records} rowId //Example : for the products Table, the ID is ProductId so the rowId = "ProductId" which is the name of the Primary Key column, it's usefull for getting informations or deleting
 */

function addDataTable(id, columnDefs, url, rowId, filters) { /*filters = [ { id, isList, ignoreOnChange }, { ... }, ... ] */
    return $('#' + id).DataTable({
        "searchable": true,
        "bDestroy": true,
        "ordering": true,
        "serverSide": true,
        "responsive": true,
        "sortable": true,
        "processing": true,
        "paging": true,
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "pageLength": 10,
        //"dom": "<'row'<'col-sm-6'l><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>", // datatable layout
        //"pagingType": "bootstrap_extended",
        ajax: {
            url: url,
            type: "POST",
            data: function (d) {
                if (filters != null && typeof filters != 'undefined') {
                    filters.forEach(function (filter) {
                        var filterValue = $("#" + filter.id).val();
                        if (filter.isList) { //avoid having the backend try to parse null as List<T> (exception)
                            if (filterValue != null) {
                                d[filter.id] = filterValue;
                            }
                            else {
                                d[filter.id] = [];
                            }
                        }
                        else { //filter value is atomic
                            d[filter.id] = filterValue;
                        }
                    });
                }
                return "req=" + JSON.stringify(d);
            }
        },
        rowId: rowId
        },
        columnDefs: columnDefs,
        order: [
            [0, 'asc']
        ]
    });
}

//Use this to handle the costum filters in a dataTable

function autoRenderDataTable(id, columnDefs, url, rowId, filters) {
    var selector = "";
    var filterIds = [];
    filters.forEach(function (filter) {
        if (!filter.ignoreOnChange)
           filterIds.push("#" + filter.id);
    });
    selector = filterIds.join();
    $(selector).on("change", function () {
        addDataTable(id, columnDefs, url, rowId, filters);
    });
}

/**
 * This function will check for you the inputs, to avoid using many scripts to check every single form, just use the tag REQUIRED and this
* function will check if it's null or not and will display a message for the user, USE the function Send(ID, URL) if you want to use this
* funtion on many forms in the same parent, it will automatically extract and sen the form inputs as an array of objects.
 * @param {The id of the element that contain the form} elementId
 */
function check(elementId) {
    var inputs = $('#' + elementId + ' .form-control')
    var test = true
    const requiredFields = Array.from(inputs).filter(input => input.required);
    requiredFields.forEach(function (field) {
        text = $(field).parent().children('label').text()
        if ($(field).val() == "") {
            if (text.indexOf("* ") >= 0)
                $(field).parent().children('label').text(text)
            else $(field).parent().children('label').text(text + '* ')

            $(field).parent().children('label').css("color", "red");
            test = false
        }
        else {
            if (text.indexOf("* ") >= 0)
                $(field).parent().children('label').text(text.replace('* ', ''))

            $(field).parent().children('label').css("color", "green");
        }

    });
    return test
}
/**
 * this function will remove the HTML of a given element by ID, usefull to avoid retyping the same code every time we want to remove something
* specially because we always use the multi add.
 * @param {the id of the element} elementId
 */
function deleteElement(elementId) {
    $('#' + elementId).remove()
}

/*
* When you serializ a form it become like this : data=example&name=example&something=example
* this method will turn that into a valid JsonString : "{'data':'example', 'name':example', 'something':'example'}"
*/
function FormToJsonString(form) {
    var o = {};
    var a = $(form).serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return JSON.stringify(o);
}

/**
 * This function will extract the information of the formS in the same element ID (ModalBody) and will create an array of objects
* to send the data to the given ID, in the controller u can use : List<Objects>
* PLEASE NOTE: This function use the Check function to validate the form data
 * @param {any} modalBody
 * @param {any} url
 */
function send(modalBody, url, option) {
    $('.apply').attr("disabled", "disabled")
    if (!check(modalBody))
    {
        toastr["warning"]("Merci de vérifier les données que vous avez saisi !")
        return 0;
    }
        
    $('.loader').show()
    var frms = $('#' + modalBody + ' form')
    var json = "["
    $.each(frms, function (frm, value) {
        var o = {};
        var a = $(value).serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        json += JSON.stringify(o) + ','
    });
    json = json.slice(0, -1)
    json += "]"
    secureCheck = JSON.parse(json)[0]
    
    if (secureCheck[Object.keys(secureCheck)[0]].length < 1)
    {
        toastr["warning"]("Veuillez ajouter au moins une valeur svp!")
        $('.loader').hide()
        return null
    }
      
    test = ajax(json, url, "POST")

    test.success(function (data) {
        if (data.status === "success") {
            $('.loader').hide()
            toastr["success"]("Opération réussite !")
            
                
                if (option == 0) {
                    refreshForm(modalBody)
                    $('.modal').modal('hide')
                    $('.table').DataTable().ajax.reload()
                    $('.apply').removeAttr("disabled")
                }
                else if (option == -1)
                {
                    $('.modal').modal('hide')
                    $('.table').DataTable().ajax.reload()
                    $('.apply').removeAttr("disabled")
                }
           
        }

    })
    test.error(function (msg) {
        $('.loader').hide()
        toastr["error"]("Il y a un problème quelque part, Actualiser la page et réessayer.")
    })
    return test;
}

function initializeToastr()
{
    toastr.options = {
        "closeButton": true, // true/false
        "debug": false, // true/false
        "newestOnTop": false, // true/false
        "progressBar": false, // true/false
        "positionClass": "toast-top-right", // toast-top-right / toast-top-left / toast-bottom-right / toast-bottom-left
        "preventDuplicates": false, //true/false
        "onclick": null,
        "showDuration": "300", // in milliseconds
        "hideDuration": "1000", // in milliseconds
        "timeOut": "5000", // in milliseconds
        "extendedTimeOut": "1000", // in milliseconds
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}


function addDateRangePicker(pickerId, minInputId, maxInputId) {
    $('#' + minInputId).val(moment().startOf('month').format("YYYY-MM-DD")).trigger('change');
    $('#' + maxInputId).val(moment().endOf('month').format("YYYY-MM-DD")).trigger('change');
    $('#' + pickerId + ' span').html(moment().startOf('month').format("MMMM D, YYYY") + ' - ' + moment().endOf('month').format("MMMM D, YYYY"));

    $('#' + pickerId).daterangepicker({
        locale: {
            minInputId: moment(),
            maxInputId: moment(),
            "format": "DD/MM/YYYY",
            "separator": " - ",
            "applyLabel": "Appliquer",
            "cancelLabel": "Annuler",
            "fromLabel": "De",
            "toLabel": "A",
            "customRangeLabel": "Période Personalisée",
            "weekLabel": "S",
            "daysOfWeek": [
                "Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"
            ],
            "monthNames": [
                "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"
            ],
            "firstDay": 1
        },
        ranges: {
            'Aujourd\'hui': [moment(), moment()],
            'Hier': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '7 Derniers Jours': [moment().subtract(6, 'days'), moment()],
            '30 Derniers Jours': [moment().subtract(29, 'days'), moment()],
            'Ce Mois': [moment().startOf('month'), moment().endOf('month')],
            'Dernier Mois': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        opens: "left"
    },
        function (start, end) {
            $('#' + pickerId + ' span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            $('#' + minInputId).val(start.format('YYYY-MM-DD')).trigger('change');
            $('#' + maxInputId).val(end.format('YYYY-MM-DD')).trigger('change');
        }
    );
}

function addPieChart(elementId, dataUrl, title, valueField, titleField, filters) {
    var requestData = {};
    if (filters != null) {
        filters.forEach(function (filter) {
            var filterValue = $("#" + filter.id).val();
            if (filter.isList) { //avoid having the backend try to parse null as List<T> (exception)
                if (filterValue != null) {
                    requestData[filter.id] = filterValue;
                }
                else {
                    requestData[filter.id] = [];
                }
            }
            else { //filter value is atomic
                requestData[filter.id] = filterValue;
            }
        });
    };
    $.ajax({
        type: "POST",
        url: dataUrl,
        data: "req=" + JSON.stringify(requestData),
        success: function (data) {
            chartData = [];
            console.log(data)
            data.forEach(function (stat) {
                chartData.push({ name: stat[titleField], y: stat[valueField] });
            });
            console.log(chartData)
            Highcharts.chart(elementId, {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                credits: {
                    enabled: false
                },
                colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                    return {
                        radialGradient: {
                            cx: 0.5,
                            cy: 0.3,
                            r: 0.7
                        },
                        stops: [
                            [0, color],
                            [1, Highcharts.Color(color).brighten(-0.15).get('rgb')] // darken
                        ]
                    };
                }),
                title: {
                    text: title,
                    style: {
                        //color: '#539fcc',
                    },
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}:<br> <b>{y}</b> ' + titleField,
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    },
                    size: '70%'
                },
                series: [{
                    name: 'Pourcentage',
                    colorByPoint: true,
                    data: chartData
                }]
            });
        }
    })
}

function autoRenderPieChart(elementId, dataUrl, title, valueField, titleField, filters) {
    var selector = "";
    var filterIds = [];
    filters.forEach(function (filter) {
        if (!filter.ignoreOnChange)
            filterIds.push("#" + filter.id);
    });
    selector = filterIds.join();
    $(selector).on("change", function () {
        addPieChart(elementId, dataUrl, title, valueField, titleField, filters);
    });
}
