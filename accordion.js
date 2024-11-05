document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq dt");
    faqItems.forEach(item => {
        item.addEventListener("click", function () {
            const answer = this.nextElementSibling;
            answer.classList.toggle("show");
        });
    });
});