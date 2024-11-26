from marshmallow import Schema, fields

class UserSchema(Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    address = fields.Str(required=True)
    city = fields.Str(required=True)
    country = fields.Str(required=True)
    phone_number = fields.Str(required=True)

    email = fields.Email(required=True)
    username = fields.Str(required=True)
    password = fields.Str(required=True)

class UserLoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)

# Not used 
# Not sure an image file can be checked properly with a schema
class CreatePostSchema(Schema):
    username = fields.Str(required=True)
    text = fields.Str(required=False)
    image = fields.Str(required=False)