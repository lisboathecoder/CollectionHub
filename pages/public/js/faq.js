document.addEventListener('DOMContentLoaded', () => {
    
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

});