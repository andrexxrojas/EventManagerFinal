import { pushToList, getList, updateData } from '/JS/fireScript.js'
let currentGroup;
//let groups = document.querySelectorAll(".group")
let tableContainer = document.querySelector(".tableExtraContainer")
let fullAccess;
let groupContainer = document.querySelector(".groupTask")
let groupTitle = document.querySelector("#groupTitleText") //This is for the title of the group
let addGroupBtn = document.querySelector(".addGroupBtn")

//This function is for when the user types in a title on the left tab
//and presses enter, adding a new group.
//Also creates a new table on the right hand side

const searchBarElement = document.getElementById("search-bar-text");
searchBarElement.addEventListener("keyup", search);

if (addGroupBtn) {
    addGroupBtn.addEventListener("click", function () {
        let newGroupTitle = groupTitle.value;
        if (newGroupTitle === "") {
            return;
        } else {
            // Save groupTitle and newGroupTitle to Firebase Realtime Database
            let id = uuidv4()
            const resource = {
                groupTitle: newGroupTitle,
                groupId: id,
                color: getRandomLightColor()
            };
            try {
                pushToList('groups', resource, true)
                createGroupElement(newGroupTitle, resource['uniqueId']);
                createTable(newGroupTitle, id);
                groupTitle.value = ''
            } catch (error) {
                alert('Error encountered when adding group')
            }
        }
    })
}
function createTaskTemp(body, textInput, uniqueKey, status) {
    console.log(uniqueKey)
    let row = document.createElement("tr")

    let taskTitle = document.createElement("td")
    taskTitle.classList = "taskTitle"
    taskTitle.innerHTML = textInput

    let taskProgress = document.createElement("td")
    taskProgress.classList = "taskProgress"

    let customSelect = document.createElement("div")
    customSelect.classList = "custom-select"

    let select = document.createElement("select")
    let optionOne = document.createElement("option")
    optionOne.value = "todo"
    optionOne.innerHTML = "TO DO"
    let optionTwo = document.createElement("option")
    optionTwo.value = "inprogress"
    optionTwo.innerHTML = "IN PROGRESS"
    let optionThree = document.createElement("option")
    optionThree.value = "done"
    optionThree.innerHTML = "DONE"

    if (status !== undefined) {
        console.log(status)
        switch (status.toLowerCase()) {
            case 'todo': break;
            case 'inprogress': optionTwo.selected = true
                break;
            case 'done': optionThree.selected = true
        }
    }

    select.appendChild(optionOne)
    select.appendChild(optionTwo)
    select.appendChild(optionThree)

    select.addEventListener('change', (selectV) => {
        const update = { status: selectV.target.value }
        updateData(update, `groups/TASK_CONTAINER/${uniqueKey}`)
    })

    if (!fullAccess) {
        select.disabled = true;
    }

    customSelect.appendChild(select)
    taskProgress.appendChild(customSelect)

    row.appendChild(taskTitle)
    row.appendChild(taskProgress)

    body.appendChild(row)
}

// Function to create a group element
function createGroupElement(newGroupTitle, cKey, dbDate) {
    let group = document.createElement("div");
    group.classList = "group";
    group.dataset.dK = cKey
    let groupTitleDiv = document.createElement("div");
    groupTitleDiv.classList = "groupTitle";

    let icon = document.createElement("i");
    icon.classList = "fa-solid fa-angle-right";

    let title = document.createElement("p");
    title.innerHTML = newGroupTitle;
    title.setAttribute("data-title", newGroupTitle); // Add data-title attribute

    groupTitleDiv.appendChild(icon);
    groupTitleDiv.appendChild(title);

    group.appendChild(groupTitleDiv);
    group.appendChild(setDueDate(cKey, (dbDate) ? dbDate : null))

    group.addEventListener("click", function (e) {

        if (e.target.parentNode.classList[0] === "group" || e.target.parentNode.classList[0] === "groupTitle") {
            if (group.classList.contains("active")) {
                group.classList.remove("active")
            } else {
                group.classList.add("active")
            }
        } else {
            return
        }

    })


    groupContainer.appendChild(group);
}

function setDueDate(cKey, dbDate) {
    //For due date
    let date = document.createElement("div")
    date.classList = "date"
    //From: 
    let divOne = document.createElement("div")
    let labelOne = document.createElement("label")
    labelOne.innerHTML = "Due Date:"

    let inputOne = document.createElement("input")
    inputOne.setAttribute("type", "date")
    inputOne.classList = "dueDate"
    inputOne.disabled=(fullAccess)?false:true

    inputOne.addEventListener("blur", async function () {
        const res = { due_Date: inputOne.value }
        updateData(res, `groups/${cKey}`)
        let dateArr = inputOne.value.split("-")

        if (dateArr.length > 1) {
            let tableArr = document.querySelectorAll(".table")
            for (let i = 0; i < tableArr.length; i++) {
                let data = await getList(`groups/${cKey}`)
                let val = data.val()
                if (val.groupId === tableArr[i].dataset.dK) {
                    tableArr[i].querySelector(".titleContainer .tableDueDate").innerHTML = reformatDate(dateArr)
                }
            }
        }

    })
    if (dbDate) {
        inputOne.value = dbDate;
        inputOne.dispatchEvent(new Event('blur'));
    }
    divOne.appendChild(labelOne)
    divOne.appendChild(inputOne)

    date.appendChild(divOne)
    return date
}

function reformatDate(dateArr) {
    return `${dateArr[1]} / ${dateArr[2]} / ${dateArr[0]}`
}

function createTableTemplate(tableTitle, cKey, due_Date) {
    let table = document.createElement("div")
    let dateArr;
    if (due_Date) {
        dateArr = due_Date.split("-")
    }
    table.classList = "table"
    table.dataset.dK = cKey

    let titleContainer = document.createElement("div")
    titleContainer.classList = "titleContainer"
    let title = document.createElement("p")
    title.innerHTML = tableTitle

    let dueDate = document.createElement("p")
    dueDate.classList = "tableDueDate"
    dueDate.innerHTML = (due_Date) ? reformatDate(dateArr) : "Date not set"

    titleContainer.appendChild(title)
    titleContainer.appendChild(dueDate)
    table.appendChild(titleContainer)

    let contentTable = document.createElement("table")
    contentTable.classList = "contentTable"

    let tbody = document.createElement("tbody")
    contentTable.appendChild(tbody)

    table.appendChild(contentTable)

    let createNewTask = document.createElement("div")
    createNewTask.classList = "createNewTask"

    let icon = document.createElement("i")
    icon.classList = "fa-solid fa-plus"

    let createTaskP = document.createElement("p")
    createTaskP.innerHTML = "Create task"

    let newBox = document.createElement("div")
    newBox.classList = "newBox"

    return [table, titleContainer, title, contentTable,
        tbody, createNewTask, icon, createTaskP,
        newBox]
}

//This function is used in the "addGroupBtn.addEventListener..."
//It's what helps add a new table on the right hand side
//When a user adds a new group
function createTable(tableTitle, cKey, dueDate) {
    let components = createTableTemplate(tableTitle, cKey, dueDate)

    //-- This handles adding a new row to the table
    //This is for the "Create task" button in the (right-side) table view
    if (fullAccess) {
        components[5].addEventListener("click", function () {
            //When user clicks on the "Create task button"
            //It opens up the overlay with the input text field
            if (!components[5].classList.contains("active")) {
                components[8].style.display = "block";
                components[5].classList.add("active")
            }
            setCurrentGroup(this)
        })

        //This is for the input text field that appears after clicking
        //the "Create task" button.
        components[8].addEventListener("keyup", function (event) {
            let textInput = components[8].querySelector("input").value;

            //If the user clicks enter
            if (event.keyCode == 13) {
                if (textInput != "") { //If the text field is not empty when user clicks enter
                    // Get the group ID for the current group
                    const groupId = document.querySelector('.groupTitle p').textContent;
                    // Save the task to Firebase Realtime Database under the respective group title
                    const contKey = currentGroup.dataset.dK
                    const resource = {
                        task: textInput,
                        status: 'todo', // You can add additional fields as needed
                        groupId: contKey
                    };
                    //since true, a uniqueId is added to the task
                    pushToList("groups/TASK_CONTAINER", resource, true)
                    // A new row is added 
                    createTaskTemp(components[4], textInput, resource['uniqueId'])

                    // Clear the input field and hide the overlay
                    components[8].querySelector("input").value = "";
                    components[8].style.display = "none";
                    components[5].classList.remove("active");
                }
            }
        })

        //-- This handles adding a new row to the table

        //This is for the overlay text input field
        let input = document.createElement("input")
        input.setAttribute("type", "text")
        input.setAttribute("placeholder", "What is the task you want to add?")

        components[8].appendChild(input)

        components[5].appendChild(components[6])
        components[5].appendChild(components[7])
        components[5].appendChild(components[8])

        components[0].appendChild(components[5])
    }
    //Lastly, all information about new row is added into the table container
    tableContainer.appendChild(components[0])
}


// Fetch group titles and tasks from Firebase when the page loads
window.onload = async function () {
    fullAccess = canWriteRead();
    let list = await getList('groups')
    if (list.exists()) {
        list.forEach((data) => {
            const values = data.val()
            if (values.hasOwnProperty('groupId') && values.hasOwnProperty('groupTitle')) {
                createGroupElement(values.groupTitle, values.uniqueId, values.due_Date)
                createTable(values.groupTitle, values.groupId, values.due_Date)
            } else {
                Object.values(values).forEach((taskData) => {
                    const findGroup = document.querySelector(`.table[data-d-K="${taskData.groupId}"] .contentTable`)
                    const tbody = document.createElement('tbody')
                    createTaskTemp(tbody, taskData.task, taskData.uniqueId, taskData.status)
                    findGroup.appendChild(tbody)

                })
            }
        });
    }
};

function getRandomLightColor() {
  // Minimum acceptable contrast ratio (higher means lighter colors)
  const threshold = 4.5;

  // Function to generate a random hex color code
  function randomColor() {
    const hex = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    return hex;
  }

  // Function to calculate contrast ratio between two colors
  function contrastRatio(color1, color2) {
    const rgb1 = [parseInt(color1.substring(1, 3), 16), parseInt(color1.substring(3, 5), 16), parseInt(color1.substring(5, 7), 16)];
    const rgb2 = [0, 0, 0]; // Black text (can be adjusted for different text colors)

    const lum1 = 0.2126 * rgb1[0] + 0.7152 * rgb1[1] + 0.0722 * rgb1[2];
    const lum2 = 0.2126 * rgb2[0] + 0.7152 * rgb2[1] + 0.0722 * rgb2[2];

    const ratio = (lum1 > lum2) ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
    return ratio;
  }

  // Generate random color and check contrast until it meets threshold
  let color;
  do {
    color = randomColor();
  } while (contrastRatio(color, "#000000") < threshold); // Check contrast with black text

  return color;
}

function setCurrentGroup(groupN) {
    currentGroup = groupN.parentElement;
}

function search() {

    let searchBox = document.getElementById("search-bar-text").value.toUpperCase();
    let tables = document.querySelectorAll(".table")


    for (let i = 0; i < tables.length; i++) {
        const titleContainer = tables[i].querySelector(".titleContainer")
        const title = titleContainer.querySelector("p")

        if (title) {
            const textValue = title.textContent.toUpperCase()

            if (textValue.indexOf(searchBox) > -1) {
                tables[i].style.display = "";
            } else {
                tables[i].style.display = "none";
            }
        }
    }

}

function canWriteRead() {
    const bodyEl = document.querySelector('body')
    return (bodyEl.dataset.roleK === 'guest') ? false : true
}
