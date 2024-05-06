import { getList, filterbyRequest } from "/JS/fireScript.js";

//For circular progress
let conttable = document.querySelector(".contentTable");
let evetable = document.querySelector("#events")
let todo = '#ADD8E6';
let done = '#355E3B';
let inprog = '#ff0000';
var progContain = document.querySelector('.progressContainer')

//updateProgressBar();
function createGroupProg(progtext, taskNum) {
    const div = document.createElement("div")
    div.className = "groupProgress"
    div.appendChild(createLegends(taskNum))
    div.appendChild(createBox(taskNum))
    div.appendChild(createGroupText(progtext, taskNum));
    progContain.appendChild(div)
}

function createLegends(taskNum) {
    const legendDiv = document.createElement("div");
    legendDiv.className = "legendText"
    const table = document.createElement("table");
    table.style.width = '100%';

    const divtodo = document.createElement("div");
    divtodo.className = 'todoLegend'
    const divdone = document.createElement("div");
    divdone.className = 'doneLegend'
    const divinprog = document.createElement("div");
    divinprog.className = 'progLegend'

    divtodo.style.backgroundColor = todo;
    divdone.style.backgroundColor = done;
    divinprog.style.backgroundColor = inprog;

    for (let i = 1; i <= 3; i++) {
        if (taskNum[i] == 0) continue;
        else {
            const row = table.insertRow();
            const td1 = row.insertCell();
            const td2 = row.insertCell();
            const label = document.createElement("p");
            const floor = Math.floor(taskNum[i] / taskNum[0] * 100)
            switch (i) {
                case 1: {
                    label.textContent = `TODO(${floor}%)`
                    td1.appendChild(divtodo)
                } break;
                case 2: {
                    label.textContent = `DONE(${floor}%)`
                    td1.appendChild(divdone)
                } break;
                case 3: {
                    label.textContent = `IN PROGRESS(${floor}%)`
                    td1.appendChild(divinprog)
                }
            }
            td2.appendChild(label)
        }
    }
    legendDiv.appendChild(table)
    return legendDiv;
}

function createBox(taskNum) {
    const box = document.createElement('div')
    box.className = 'box'
    box.appendChild(createProgressBar(taskNum))
    return box
}

function createOverallValue(taskNum) {
    let weighted_percentage = (taskNum[0] === 0) ? 0 : ((taskNum[2] * 1) + (taskNum[3] * 0.5) + (taskNum[1] * 0)) / taskNum[0] * 100
    const val_cont = document.createElement('div')
    val_cont.className = "value-container"
    val_cont.textContent = `${weighted_percentage}%`
    return val_cont
}

function createProgressBar(taskNum) {
    const pie = document.createElement('div')
    pie.className = 'circular-progress'
    if (taskNum[0] === 0) {
        pie.style.background = `black`
    } else {
        let counter = 0;
        let collect = []
        for (let i = 1; i < taskNum.length; i++) {
            if (taskNum[i] !== 0) {
                const deg = Math.floor(taskNum[i] / taskNum[0] * 100)
                switch (i) {
                    case 1: {
                        collect.push(`${todo} ${deg}%`)
                    } break;
                    case 2: {
                        const degFormer = Math.floor(taskNum[i - 1] / taskNum[0] * 100)
                        collect.push(`${done} 0 ${degFormer + deg}%`)
                    } break;
                    case 3: {
                        collect.push(`${inprog} 0`)
                    }
                }
            }
        }
        console.log(collect)
        pie.style.background = (collect.length === 1) ? collect[0] : `conic-gradient(${collect.join(", ")})`
    }
    //pie.style.background=`conic-gradient(${todo} ${10 * 3.6}deg, ${done} ${10 * 3.6}deg ${70 * 3.6}deg, ${inprog} ${70 * 3.6}deg)`
    //pie.style.background = `conic-gradient(${string}, ${todo} ${10 * 3.6}deg ${70 * 3.6}deg, ${done} ${70 * 3.6}deg)`
    pie.appendChild(createOverallValue(taskNum))
    return pie
}

function createGroupText(progT, tasksNum) {
    const groupText = document.createElement("div")
    groupText.className = "groupText"

    const progH = document.createElement("h4")
    progH.className = "progressTitle"
    progH.textContent = progT

    const overallTasksNum = document.createElement("p")
    overallTasksNum.className = "progressTaskNum"
    overallTasksNum.textContent = `${tasksNum[0]} tasks`

    groupText.appendChild(progH)
    groupText.appendChild(overallTasksNum)
    return groupText
}

window.onload = async function () {
    let groupCounter = 0
    let taskCounter = 0
    let eventCounter = 0
    let list = await getList('groups')
    let container_list = await getList('groups/TASK_CONTAINER')
    let events_list = await getList('Events')
    if (list.exists()) {
        groupCounter++;
        list.forEach((data) => {
            const values = data.val()
            if (values.hasOwnProperty('groupId') && values.hasOwnProperty('groupTitle')) {
                let containerTasks = getTaskStats(values.groupId, container_list)
                createGroupProg(values.groupTitle, containerTasks)
            }
        });
    }

    if (container_list.exists()) {
        taskCounter++;
        container_list.forEach((data) => {
            filterbyRequest('groups/', 'groupId', data.val().groupId).then(filter => {
                const values = filter.val()
                const key = Object.keys(values)[0]

                createContainerRow(data.val(), values[key].due_Date, values[key].groupTitle, values[key].color)
            })
        })
    }

    if (events_list.exists()) {
        eventCounter++;
        events_list.forEach((data) => {
            createEventRow(data.val())
        })
    }

    if (groupCounter === 0) {
        const boxCont = document.querySelector('.hu');
        emptyConv(boxCont)
    }
    if (taskCounter === 0) {
        const taskCont = document.getElementById('taskContent');
        emptyConv(taskCont)
    } if (eventCounter === 0) {
        const taskCont = document.getElementById('eventContent');
        emptyConv(taskCont)
    }
};

function emptyConv(element) {
    element.style.display = "flex"
    element.style.alignItems = 'center'
    element.style.justifyContent = "center"
    element.style.backgroundColor = "transparent"
    element.style.fontWeight = "bold"
    element.style.fontSize = "20px"

    element.textContent = "Nothing to preview here"
}

async function createEventRow(data) {
    const row = evetable.insertRow();
    populateRow(data, row, null, null, null, "EVENT")
}

async function createContainerRow(data, parentDue, parentTitle, color) {
    const row = conttable.insertRow();
    populateRow(data, row, parentDue, parentTitle, color, 'TASK')
}

function populateRow(record, row, parentDue, parentTitle, color, type) {
    switch (type) {
        case 'TASK': {
            const td1 = row.insertCell();
            const td2 = row.insertCell();
            const td3 = row.insertCell();

            td1.className = "taskTitle"
            td2.className = "taskProgress"
            td3.className = "taskDueDate"

            td1.appendChild(createNameDiv(record.task, parentTitle, color))
            td2.appendChild(createSelect(record.status))
            td3.textContent = parentDue
        }
            break;
        case 'EVENT': {
            const td1 = row.insertCell();
            const td2 = row.insertCell();
            const td3 = row.insertCell();
            const td4 = row.insertCell();

            td1.textContent = record.summary
            td2.textContent = record.description
            td3.textContent = `${record.start_date} | ${record.end_date}`
            td4.textContent = `${record.start_time} | ${record.end_time}`
        }
    }

}

function createNameDiv(task, name, color) {
    const div = document.createElement('div')
    const p = document.createElement('p')
    const groupDiv = document.createElement('div')

    groupDiv.className = "groupDiv"
    groupDiv.style.backgroundColor = color

    div.className = "nameWithGroup"

    p.textContent = task
    groupDiv.textContent = name

    div.appendChild(p)
    div.appendChild(groupDiv)

    return div
}


function createSelect(word) {
    const customSelect = document.createElement('div');
    customSelect.className = "custom-select"
    const select = document.createElement('select');
    let optionText;
    switch (word.toLowerCase()) {
        case "todo":
            optionText = "TO DO";
            break;
        case "done":
            optionText = "DONE";
            break;
        case "inprogress":
            optionText = "IN PROGRESS";
    }

    const option = document.createElement('option');
    option.text = optionText;
    option.value = word; // Set option value to match the original word
    select.disabled = true;
    select.appendChild(option);
    customSelect.appendChild(select)
    return customSelect;
}

function updateStatsArray(task, stats) {
    switch (task.status.toLowerCase()) {
        case "todo": stats[1]++;
            break;
        case "done": stats[2]++;
            break;
        case "inprogress": stats[3]++;
    }
    stats[0]++;
}

function getTaskStats(groupId, arr) {
    const stats = [0, 0, 0, 0];
    if (arr.exists()) {
        arr.forEach((data) => {
            let val = data.val()
            if (val.groupId === groupId) { updateStatsArray(val, stats) }
        })
    }
    return stats
}