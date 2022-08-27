// $(document).ready(function () {

    $('#table_id').DataTable();   //jquery data table
  
  
  
    $("#form").validate({
      errorClass: "validerrors",
      
  
      rules: {
        
          
        username: {       
          required: true,
          minlength: 4,
          alphanumeric : true,
          lettersonly : true
        },
  
        email: {
          required: true,
          email: true
        },
  
        password: {
          required: true,
          minlength: 5
        },
  
        confirmpassword: {
          required: true,
          minlength: 5,
          equalTo : "#password"
        },
  
        mobilenumber: {
            required: true,
            minlength: 10
          }
  
      }, messages : {
  
        firstname: {  
          required: "Enter first name",
          minlength: "Enter atleast 3 characters",
          // lettersonly: "Use alphabets only"
        },
        lastname: {          
          required: "Enter last name",
          minlength: "Enter atleast 3 characters",
          // lettersonly: "Use alphabets only "
        },
        firstname: {          
          required: "Enter first name",
          minlength: "Enter atleast 3 characters",
          // lettersonly: "No special characters allowed"
        },
        confirmpassword: {
          equalTo : "Passwords doesn't match"
        },
      }
    })
  // })
  
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  
  // LettersOnly
  
  jQuery.validator.addMethod("lettersonly", function(value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
  }, "Letters only please"); 
  
  // Alphanumeric
  
  jQuery.validator.addMethod("alphanumeric", function(value, element) {
    return this.optional(element) || /^[\w.]+$/i.test(value);
  }, "Letters, numbers, and underscores only please")