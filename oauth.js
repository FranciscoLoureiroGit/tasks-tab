window.onload = function() {
    sessionStorage.setItem('tasklists', '');
    getData();
    setInterval(getData,10000);
    addSelectOnChange();
    addTaskListener();
};

function getData(){
    sessionStorage.removeItem('tasks');
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        let init = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };

        fetch(
            'https://www.googleapis.com/tasks/v1/users/@me/lists',
            init)
            .then((response) => response.json())
            .then(function(taskslists) {
                let tasks = [];

                console.log(taskslists);

                checkTasklistOrder(taskslists);

                taskslists.items.forEach(element1 => fetch(
                    'https://www.googleapis.com/tasks/v1/lists/' + element1.id + '/tasks',
                    init)
                    .then((response) => response.json())
                    .then(function (data) {
                        console.log(data);
                        if(data.hasOwnProperty('items')){
                            data.items.forEach(element2 => {
                                tasks.push({
                                    title: element2.title,
                                    id: element2.id,
                                    taskListTitle: element1.title,
                                    taskListId: element1.id,
                                    updated: element2.updated,
                                });
                                sessionStorage.setItem(element2.id,element1.id);
                            });
                            sessionStorage.setItem('tasks', JSON.stringify(tasks));
                        }
                    }).then(printTasks)
                );
            })
            .catch(error => {
                console.error("error!");
                console.error(error);
            });
    });
}

function completeTask(id) {
    let taskListId = sessionStorage.getItem(id);
    console.log(sessionStorage)

    const Url = "https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks/" + id;


    chrome.identity.getAuthToken({interactive: true}, function(token) {
        let init = {
            method: 'DELETE',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };

        fetch(Url, init)
            .then(response => {
                if (!response.ok){
                    console.error("error!")
                }
            });
    });
    getData();
}

function addTask(taskListId, title) {
    const Url = "https://www.googleapis.com/tasks/v1/lists/" + taskListId + "/tasks";
    let newtask = {
        title: title
    };

    chrome.identity.getAuthToken({interactive: true}, function(token) {
        let init = {
            method: 'POST',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newtask),
            'contentType': 'json'
        };

        fetch(Url, init)
            .then(response => {
                if (!response.ok){
                    console.error("error!")
                }
            }).then(getData);
    });

}

function compare( a, b ) {
    if ( a.taskListId < b.taskListId ){
        return -1;
    }
    if ( a.taskListId > b.taskListId ){
        return 1;
    }
    if ( a.taskListId === b.taskListId ){
        if ( a.id < b.id ){
            return -1;
        }
        if ( a.id > b.id ){
            return 1;
        }
    }
    return 0;
}

function printTasks(){
    let output = '';

    let tasklist = document.getElementById('list').value;
    let tasks = JSON.parse(sessionStorage.getItem('tasks'));

    if (tasks != null) {
        tasks.sort(compare);
        tasks.forEach(element => {
            if (element.taskListId === tasklist){
                output += '<br></<br><label  class="' + element.id + '" id="task" ><input name="task" type="checkbox" class="checkbox">' + element.title + '</label><br></<br>'
            }
        })
    }
    $('#taskslists').html(output);
    completeTaskListener();
}

function completeTaskListener() {
    let tasks = document.getElementsByName('task');

    // onClick's logic below:
    tasks.forEach(element => element.parentElement.addEventListener('click', function () {
        completeTask(element.parentElement.className);
    }))
}

function addTaskListener() {
    let input = document.getElementById('submit');

    input.addEventListener('click',function (e) {
        let title = document.getElementById("newtask").value;
        let taskListId = document.getElementById("list").value;
        addTask(taskListId,title);
    })
}

function addSelectOnChange() {
    let select = document.getElementById('list');

    select.addEventListener('change', function () {
        printTasks();
    })
}

function checkTasklistOrder(taskslists) {
    let taskListsCache = sessionStorage.getItem('tasklists');
    let select = document.getElementById('list');
    let previous = select.value;

    if ( !(JSON.stringify(taskslists) === taskListsCache)){
        sessionStorage.setItem('tasklists', JSON.stringify(taskslists));

        let child = select.lastElementChild;
        while (child) {
            select.removeChild(child);
            child = select.lastElementChild;
        }

        taskslists.items.forEach(element => {
            let option = document.createElement('option');
            option.appendChild(document.createTextNode(element.title));
            option.value = element.id;
            select.appendChild(option);
        });

        //check selected tasklist
        if (previous) {
            document.getElementById('list').value = previous;
        }
    }
}