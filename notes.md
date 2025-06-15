UDEMY COURSE:
--------------------------------------------------------------------------------------------------------------------------
101.Backend project structure----------------------------------src\app.js
Middleware (as in your code):

CORS configuration for cross-origin requests

Body parsers for JSON and URL-encoded data

Static file serving

Environment Variables:

Store sensitive/configurable data like CORS_ORIGIN

Use packages like dotenv to load them
--------------------------------------------------------------------------------------------------------------------------
102.Connect database professionally in mern----------------Configuration file -------------src\db\index.js
-----------------------------------------------------------Server initialization-----------src\index.js
----------------------------------------------------------------------------------------------------------------------------
103.Standarized error and response from server in MERN-----src\utils\asyncHandler.js, src\utils\ApiResponse.js, src\utils\ApiError.js
------------------------------------------------------------------------------------------------------------------------------
104.Healthcheck routes and testing with postman--------------src\controllers\healthcheck.controller.js
-------------------------------------------------------------src\routes\healthcheck.router.js
----------------------------------------------------------------------------------------------------------------------------------
105.Build Models in MongoDB with Aggregation Plugin----------src\models
-----------------------------------------------------------------------------------------------------------------------------------
106.Hooks and methods with mongoose with JWT-----------------src\models\user.models.js - line

Hooks (or middleware) allow you to execute functions before/after specific Mongoose operations (e.g., save, validate, remove).
Use Case: Auto-hashing passwords before saving.

Key Points:

this refers to the current document.

isModified(field) checks if a field was changed.

Always call next() to proceed.
------------------------------------------------------------------------------------------------------------------------------------
107.How to handle files in MERN application
steps: add cookies in app.js ------------ src\app.js
       add multer middleware ------------ src\middleware\multer.middleware.js
       add cloudinary in utils----------- src\utils\cloudinary.js
------------------------------------------------------------------------------------------------------------------------------------