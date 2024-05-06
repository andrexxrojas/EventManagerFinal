//Navigation Button Function
let navBtn = document.querySelector(".navBtn");
let nav = document.querySelector("nav");

navBtn.addEventListener("click", function(){
    if(nav.classList.contains("inactive")){
        nav.classList.remove("inactive");
    }else{
        nav.classList.add("inactive");
    }
})