function addToWish(proId) {

    console.log("enterted into ajax")

    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {

            if (response.status) {

                let count = $('#wishCount').html()
                count = parseInt(count) + 1
                $('#wishCount').load(location.href+ " #wishCount")

            }

           


        }

    })


}