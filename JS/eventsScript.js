import { pushWithCustomId, getList, deleteData, updateData } from "/JS/fireScript.js"

let submitBtn = document.querySelector("#submitBtn");
let eventBlock;

submitBtn.addEventListener("click", function () {
    if (checkInputs()) {
        if (eventBlock) {
            const schedBox = document.querySelector('.scheduleBox')
            const title = schedBox.querySelector('#title').value
            const startd = schedBox.querySelector('#start-date').value
            const startt = schedBox.querySelector("#start-time").value
            const endd = schedBox.querySelector("#end-date").value
            const endt = schedBox.querySelector("#end-time").value
            const desc = schedBox.querySelector("#description").value

            editBlock(title, startd, startt, endd, endt, desc, eventBlock.dataset.eventId)
            setEventBlock(null)
        } else {
            addingNew()
        }
        clearInputs();
    }
})

async function editBlock(title, startd, startt, endd, endt, desc, id) {
    const bTitle = eventBlock.querySelector("#for-title h3")
    const bDesc = eventBlock.querySelector(".description")
    const bMeetD = eventBlock.querySelector(".meetingDate")
    const bMeetT = eventBlock.querySelector(".meetingTime")
    const timeReqs = formatTimeDisp(startd, endd, startt, endt)
    bTitle.textContent = title
    bDesc.textContent = desc
    bMeetD.textContent = reformatDateTo(startd, endd)
    bMeetT.textContent = timeReqs[0]
    const updEv = {
        'summary': title,
        'description': desc,
        'start': {
            'dateTime': Object(timeReqs[1]).toISOString(),
            'timeZone': 'Asia/Manila'
        },
        'end': {
            'dateTime': Object(timeReqs[2]).toISOString(),
            'timeZone': 'Asia/Manila'
        },
        'colorId': 9
    }

    await funcOps('UPDATE', id, updEv);
    const resource = {
        unique_id: id,
        summary: title,
        description: description,
        start_date: startd,
        end_date: endd,
        start_time: startt,
        end_time: endt
    }
    updateData(resource, `Events/${resource.unique_id}`)
}

async function addingNew() {
    let eventDet;
    let cont = createEventContainer()
    const newEv = {
        'summary': document.querySelector("#title").value,
        'description': document.querySelector("#description").value,
        'start': {
            'dateTime': cont[1][2].toISOString(),
            'timeZone': 'Asia/Manila'
        },
        'end': {
            'dateTime': cont[1][3].toISOString(),
            'timeZone': 'Asia/Manila'
        },
        'colorId': 9
    }

    await funcOps('CREATE', newEv);
    await getEventRes().then(result => {
        eventDet = result;
        const resource = {
            unique_id: result.id,
            summary: newEv.summary,
            description: newEv.description,
            start_date: cont[1][4],
            end_date: cont[1][5],
            start_time: cont[1][6],
            end_time: cont[1][7]
        }
        pushWithCustomId(`Events/${resource.unique_id}`, resource)
        cont[0].dataset.eventId = eventDet.id
    })
}

function createEventContainer(values) {
    let container = document.querySelector(".extraContainer .meetingsContainer")

    let eventItem = document.createElement("div")
    eventItem.classList = "event-d"

    //top with title, edit and delete
    let outerDiv = document.createElement("div");
    let titleDiv = document.createElement("div");
    let editdelDiv = document.createElement("div");

    outerDiv.className = "header-btns"

    titleDiv.id = "for-title"
    editdelDiv.id = "for-editdel"

    let icons = createEditDeleteIcons(eventItem)
    let mtgDateTime;
    let cTitle;
    let cDesc;
    if (values) {
        mtgDateTime = createMeetingDateTime(values.start_date, values.end_date, values.start_time, values.end_time)
        cTitle = createTitle(values.summary)
        cDesc = createDescription(values.description)
    } else {
        mtgDateTime = createMeetingDateTime()
        cTitle = createTitle()
        cDesc = createDescription()
    }

    titleDiv.appendChild(cTitle)
    editdelDiv.appendChild(icons[0])
    editdelDiv.appendChild(icons[1])

    outerDiv.appendChild(titleDiv)
    outerDiv.appendChild(editdelDiv)

    eventItem.appendChild(outerDiv)
    eventItem.appendChild(cDesc)
    eventItem.appendChild(mtgDateTime[0])
    eventItem.appendChild(mtgDateTime[1])
    container.appendChild(eventItem)

    return [eventItem, mtgDateTime]
}

function createMeetingDateTime(startdate, enddate, starttime, endtime) {
    let meetingDate = document.createElement("p")

    let startDateArr = (startdate) ? startdate : document.querySelector("#start-date").value
    let endDateArr = (enddate) ? enddate : document.querySelector("#end-date").value

    meetingDate.innerHTML = reformatDateTo(startDateArr, endDateArr)

    meetingDate.classList = "meetingDate"

    let meetingTime = document.createElement("p")
    let startTimeArr = (starttime) ? starttime : document.querySelector("#start-time").value
    let endTimeArr = (endtime) ? endtime : document.querySelector("#end-time").value

    meetingTime.classList = "meetingTime"
    const timeReqs = formatTimeDisp(startDateArr, endDateArr, startTimeArr, endTimeArr)
    meetingTime.innerHTML = timeReqs[0]
    return [meetingDate, meetingTime,
        timeReqs[1], timeReqs[2],
        startDateArr, endDateArr,
        startTimeArr, endTimeArr]
}

function formatTimeDisp(startDateArr, endDateArr, startTimeArr, endTimeArr) {
    const disp = `${startTimeArr} - ${endTimeArr}`

    let startTSplit = startTimeArr.split(':')
    let endTSplit = endTimeArr.split(':')

    const startDateTime = new Date(startDateArr)
    startDateTime.setHours(startTSplit[0], startTSplit[1])

    const endDateTime = new Date(endDateArr)
    endDateTime.setHours(endTSplit[0], endTSplit[1])

    return [disp, startDateTime, endDateTime]
}

function createDescription(desc) {
    let description = document.createElement("p")
    description.innerHTML = (desc) ? desc : document.querySelector("#description").value.trim()
    description.classList = "description"

    return description
}

function createEditDeleteIcons(eventItem) {
    let edit_icon = document.createElement("i");
    let remove_icon = document.createElement("i");

    edit_icon.classList.add("fa-solid", "fa-pen-to-square");
    edit_icon.id = "edit-event-button"
    remove_icon.classList.add("fa-solid", "fa-xmark");
    remove_icon.id = "remove-event-button"

    remove_icon.addEventListener('click', (e) => {
        setEventBlock(e)
        deleteSpec()
        funcOps('DELETE', eventItem.dataset.eventId)
        deleteData(`Events/${eventItem.dataset.eventId}`)
        setEventBlock(null)
    })

    edit_icon.addEventListener('click', (e) => {
        setEventBlock(e)
        fillEditInputs();
    })

    return [edit_icon, remove_icon]
}

function createTitle(summary) {
    let title = document.createElement("h3")
    title.innerHTML = (summary) ? summary : document.querySelector("#title").value

    return title
}

function reformatDateTo(startDateArr, endDateArr) {
    let startSplit = startDateArr.split('-')
    let endSplit = endDateArr.split('-')
    return (startDateArr === endDateArr) ? `${startSplit[1]} / ${startSplit[2]} / ${startSplit[0]}` :
        `${startSplit[1]} / ${startSplit[2]} / ${startSplit[0]} - ${endSplit[1]} / ${endSplit[2]} / ${endSplit[0]}`
}

function reformatToDate(dateStrings) {
    // Split the date string into separate day, month, and year components
    const splitDates = dateStrings.split(' - ')

    const refDates = []
    for (let i = 0; i < splitDates.length; i++) {
        const [month, day, year] = splitDates[i].split(" / ");

        // Create a Date object using the reversed order (year, month, day)
        const dateObject = new Date(year, month - 1, day);
        // Format the date object in YYYY-MM-DD format
        refDates.push(dateObject.toISOString().split('T')[0]);

    }
    return refDates
}

function fillEditInputs() {
    const pElements = eventBlock.querySelectorAll("div.event-d p")
    const statedDate = reformatToDate(pElements[1].textContent)

    const splitTimes = pElements[2].innerHTML.split('-');
    document.querySelector("#title").value = eventBlock.querySelector("div#for-title h3").innerHTML;
    document.querySelector("#description").value = pElements[0].innerHTML
    document.querySelector("#start-date").value = statedDate[0]
    document.querySelector("#end-date").value = (statedDate.length === 2) ? statedDate[1] : statedDate[0]
    document.querySelector("#start-time").value = `${splitTimes[0].trim()}`
    document.querySelector("#end-time").value = `${splitTimes[1].trim()}`
}

function clearInputs() {
    document.querySelector("#title").value = ""
    document.querySelector("#description").value = ""
    document.querySelector("#start-date").value = ""
    document.querySelector("#end-date").value = ""
    document.querySelector("#start-time").value = ""
    document.querySelector("#end-time").value = ""
}

function deleteSpec() {
    eventBlock.remove()
}

function checkInputs() {
    //Check title
    let title = document.querySelector("#title").value

    if (title === "") {
        alert("Invalid Title")
        return false;
    }

    //Check date
    let start_date = document.querySelector("#start-date").value
    let end_date = document.querySelector("#end-date").value
    if (start_date === "" || end_date === "") {
        alert("Invalid Date")
        return false;
    }

    //Check time
    let start_time = document.querySelector("#start-time").value
    let end_time = document.querySelector("#end-time").value
    let formattedDateTimes = formatTimeDisp(start_date,end_date,start_time,end_time)


    if (start_time === "" || end_time === "" || formattedDateTimes[1] >= formattedDateTimes[2]) {
        alert("Invalid Time")
        return false;
    }

    //Check description
    let desc = document.querySelector("#description").value.trim()
    if (desc === "") {
        alert("Invalid Description")
        return false;
    }
    if (desc.length >= 500) {
        alert("Description should not exceed 500 characters")
        return false;
    }
    return true;
}

function setEventBlock(e) {
    if (e) {
        eventBlock = e.target.parentNode.parentNode.parentNode
    } else {
        eventBlock = e
    }
}

window.onload = async function () {
    let list = await getList('Events')
    if (list.exists()) {
        list.forEach((data) => {
            let vals = data.val()
            let cont = createEventContainer(vals)
            cont[0].dataset.eventId = vals.unique_id
        })
    }
};