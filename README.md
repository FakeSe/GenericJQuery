# GenericJQuery

This is a JQuery library which I created in one of my projects and now it's used by all the Team.
I'm sharing it for developers to avoid writing tons of code by using ready to use methods from this library.

If you want, you can use this architecture which I created to organize the JQuery Code in my projects : 

- In you public folder under the JS folder create a folder named "Pages" and for every view create a folder under "Pages" with the same name of the View.
- For every view create 3 JS files : Crud.js, Constants.js and index.js
- Crud.js : Will contain all your methods that : ADD/EDIT/DELETE data from servers.
- Constants.js : Will contain the defenitions of your Routes (URL), Tables Ids (for example: the Id of the table that you will turn it into a DataTable) and any other element Id/Route/Constant that you need in the hole LifeCycle of the view.
- Index.js : Will contain the rest : Elements to handle, Events to Listent to...

Now let's return to our Library : 

- Most of projects have view that show the details of an entity, the route is generaly in this form : /blabla/.../balala/{id}
To avoid making requests or using the server to store the Id of the current record : getDetailId() will return the {id} value from the URL.

- You have a DataTable and you want to let the user Select rows ? use : InitializeSelection() 
    you can add the class .delete-selection to the delete button so it will stay disabled while the user didn't select a row.

- You want more ? deleteItems(table, url) : "table" is the DataTable object that you initialized and "url" is the Route to your delete Method : this function will create a list of integer with the IDs of the selected ROWS in the given table and send them to the given URL.

- This is the best function for me : ajax(data, url, method) : you call it like this :
var request = ajax(JSON.stringify(theData), "/your/route", "POST");
request.success(function(result) {/*Handle the result*/}) / request.fail(function() {/* Handle the fail*/})

- autoSubmit(button) : Are you lazy ? create a normal form, with it action/Method and submit button, give an Id for your button then for the form  give an Id with this form : buttonId+'-form' then use this method just like you use the ajax method ! Example : 
var addForm = autoSubmit($("#buttonId"));
addForm.success(function(result){}) / addForm.fail(function(result){})

- Everytime you must copy and past the definition of DataTable for each Table you create ? well, this is a lot of code ! just use this :
 * @param {the id of the table that you want to make it a DataTable} id
 * @param {The columnDefs of the DataTable} columnDefs //The definition of the columns (in your Constans file, you will find an example) 
 * @param {The URL from where you want to populate the DataTable} url
 * @param {The column Id of the records} rowId //Example : for the products Table, the ID is ProductId so the rowId = "ProductId" which is the name of the Primary Key column, it's usefull for getting informations or deleting
 * @param {Addtional filters you want to add for the DataTable} /Example : filters = [ { id, isList, ignoreOnChange }, { ... }, ... ]
 
var productsTable = addDataTable(id, columnDefs, url, rowId, filters);

-  check(elementId) : make a normal form with html attributes like : required, max, min... 
then give that form an Id or if you have multiple forms put them in a single element (a div for example) and give it an Id, then call check(containerId) : this method will validate the form for you ! 
example of use : 
if(!check("AddProductForm")) {return;} 

I highlited the most used things, the library contain other functions that will make you happy while developing and it's well documented, don't forget to contribute !

