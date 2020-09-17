$(document).ready(function() {
  $('.delete-article').on('click', function(e) {
    $target = $(e.target);

    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/articles/' + id,
      success: function(response) {
        alert('Deleting Article');
        window.location.href='/';
      },
        error: function(error) {
          console.log(error);
        }
    });
  });

  if ($('.alert-danger').length) {
    setTimeout(function() {
      $('.alert-danger').remove();
    }, 5000);
  }
});