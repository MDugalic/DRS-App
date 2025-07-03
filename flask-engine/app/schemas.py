from marshmallow import Schema, fields

class UserSchema(Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)

    address = fields.Str(required=False)
    city = fields.Str(required=False)
    country = fields.Str(required=False)
    phone_number = fields.Str(required=False)

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
    friend_id = fields.Int(required=True, metadata={"description": "ID of the friend to add or remove"})


# Schema for displaying a user's friend
class FriendSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(dump_only=True)
