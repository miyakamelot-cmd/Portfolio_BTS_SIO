$(document).ready(function() {
    function toggleCardContent(headerId, contentId) {
        const header = $('#' + headerId);
        const content = $('#' + contentId);

        header.on('click', function(e) {
            e.stopPropagation();
            
            content.slideToggle(300, function() {
                const isVisible = content.is(':visible');
                header.toggleClass('active', isVisible);
            });
        });
    }
    
    toggleCardContent('email-toggle', 'email-content');
    toggleCardContent('phone-toggle', 'phone-content');
    toggleCardContent('linkedin-toggle', 'linkedin-content');
    toggleCardContent('address-toggle', 'address-content');

     $('.card-header').on('click', function() {
         $('.card-content').not($(this).next('.card-content')).slideUp(300);
         $('.card-header').not(this).removeClass('active');
    });

});