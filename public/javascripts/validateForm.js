//validate of new, edit form
let validattionForm = function() {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function(form) {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
}();

//effect when hover card
for (const element of document.getElementsByClassName('cgCard')) {
    element.addEventListener('mouseover', function(e) {
        this.classList.add('shadow');
    });
    element.addEventListener('mouseleave', function(e) {
        this.classList.remove('shadow');
    });
}