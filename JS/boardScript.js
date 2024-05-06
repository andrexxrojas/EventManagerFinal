//Drag and drop list function
let leftBox = document.querySelector("#leftBox"); //TO DO BOARD
let middleBox = document.querySelector("#middleBox"); //IN PROGRESS BOARD
let rightBox = document.querySelector("#rightBox"); //DONE BOARD

const draggables = document.querySelectorAll(".draggable")
const containers = document.querySelectorAll(".list")

draggables.forEach(draggable => {
    draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging")
    })

    draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging")
    })
})

containers.forEach(container => {
    container.addEventListener("dragover", e => {
        e.preventDefault()
        const afterElement = getDragAfterElement(container, e.clientY)
        const draggable = document.querySelector(".dragging")
        if(afterElement == null){
            container.appendChild(draggable)
        }else{
            container.insertBefore(draggable, afterElement)
        }
    })
})

function getDragAfterElement(container, y){
    const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2

        if(offset < 0 && offset > closest.offset){
            return { offset: offset, element: child }

        }else{
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

//For searching
function search(){

    const searchBox = document.getElementById("search-bar-text").value.toUpperCase();
    const box = document.querySelectorAll(".box");
    const bName = document.getElementsByClassName("boxTitle");

    for(let i = 0; i < box.length; i++){

        let match = box[i].getElementsByClassName("boxTitle")[0];

        if(match){
            let textValue = match.textContent || match.innerHTML;

            if(textValue.toUpperCase().indexOf(searchBox) > -1){
                box[i].style.display = "";
            }else{
                box[i].style.display = "none";
            }
        }

    }

}