document.querySelectorAll('.mbti-type').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        const mbtiType = item.getAttribute('data-type');
        localStorage.setItem('selectedMBTI', mbtiType);
        window.location.href = `about_mbti.html`;
    });
});

function goBack() {
    window.history.back();
}