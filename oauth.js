window.onload = function() {
    getData();
    setInterval(getData,10000);
};

function getData(){
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
                let output = '';
                let today = new Date().getDay();
                console.log(taskslists);
                taskslists.items.forEach(element => fetch(
                    'https://www.googleapis.com/tasks/v1/lists/' + element.id + '/tasks',
                    init)
                    .then((response) => response.json())
                    .then(function (tasks) {
                        console.log(tasks);
                        if(tasks.hasOwnProperty('items')){
                            output += '<ul>' + element.title + '</ul>';
                            tasks.items.forEach(element => {
                                let taskdate = new Date(element.updated);
                                if (taskdate.getDay() === today){
                                    output += '<label onclick="completeTask()"><input type="checkbox" class="checkbox">' + element.title + '</label><br></<br><br></<br>'
                                }
                            });
                        }
                        $('#taskslists').html(output);
                    })
                );
            })
            .catch(error => {
                console.error("error!");
                console.error(error);
            });
    });
}

function completeTask() {

}