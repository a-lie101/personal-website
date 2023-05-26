
const observer = new IntersectionObserver((entries) => {
   entries.forEach((entry) => {
     console.log(entry);
     if (entry.isIntersecting) {
       entry.target.classList.add('show');
     } else {
       entry.target.classList.remove('show');
     }
   });
 });
 
 const hiddenElements = document.querySelectorAll('.hidden');
 hiddenElements.forEach((el) => observer.observe(el));

 const downloadBtn = document.querySelector(".download-btn");

downloadBtn.addEventListener("click", () => {
  window.print();
});


    
