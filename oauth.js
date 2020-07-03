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
                console.log(taskslists);
                taskslists.items.forEach(element => fetch(
                    'https://www.googleapis.com/tasks/v1/lists/' + element.id + '/tasks',
                    init)
                    .then((response) => response.json())
                    .then(function (tasks) {
                        console.log(tasks);
                        output += '<ul>' + element.title + '</ul>';
                        if(tasks.hasOwnProperty('items')){
                            tasks.items.forEach(element =>
                                output += '<li>' + element.title + '</li>');
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