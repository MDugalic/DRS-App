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

class UserSchemaWithId(UserSchema):
    id = fields.Int(required=True)

class UserLoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)

# Not used 
# Not sure an image file can be checked properly with a schema
class CreatePostSchema(Schema):
    username = fields.Str(required=True)
    text = fields.Str(required=False)
    image = fields.Str(required=False)

    from marshmallow import Schema, fields

# Schema for adding/removing a friend
class FriendActionSchema(Schema):
    friend_id = fields.Int(required=True, description="ID of the friend to add or remove")

# Schema for displaying a user's friend
class FriendSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(dump_only=True)
