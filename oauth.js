window.onload = function() {
    document.querySelector('button').addEventListener('click', function() {
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
                    console.log(taskslists);
                    taskslists.items.forEach(element => fetch(
                        'https://www.googleapis.com/tasks/v1/lists/' + element.id + '/tasks',
                        init)
                        .then((response) => response.json())
                        .then(function (tasks) {
                            console.log(tasks);
                            document.getElementById('taskslists').textContent += element.title;
                            if(tasks.hasOwnProperty('items')){
                                tasks.items.forEach(element =>
                                    document.getElementById('tasks').textContent += element.title);
                            }
                        })
                    );
                })
                .catch(error => {
                    console.error("error!");
                    console.error(error);
                });
        });
    });
};