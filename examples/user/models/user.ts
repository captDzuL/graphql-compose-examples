import { Schema, model, ObjectId } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { schemaComposer } from '../schemaComposer';

const LanguagesSchema = new Schema(
  {
    language: String,
    skill: {
      type: String,
      enum: ['basic', 'fluent', 'native'],
    },
  },
  {
    _id: false, // disable `_id` field for `Language` schema
  }
);

const AddressSchema = new Schema({
  street: String,
  geo: {
    type: [Number], // [<longitude>, <latitude>]
    index: '2dsphere', // create the geospatial index
  },
});

export const UserSchema: Schema<UserDoc> = new Schema(
  {
    name: {
      type: String,
      index: true,
    },
    age: {
      type: Number,
      index: true,
    },
    languages: {
      type: [LanguagesSchema], // you may include other schemas (also as array of embedded documents)
      default: [],
    },
    contacts: {
      // another mongoose way for providing embedded documents
      email: String,
      phones: [String], // array of strings
    },
    gender: {
      // enum field with values
      type: String,
      enum: ['male', 'female', 'ladyboy'],
    },
    address: {
      type: AddressSchema,
    },
    someMixed: {
      type: Schema.Types.Mixed,
      description: 'Some dynamic data',
    },
    salaryDecimal: {
      type: Schema.Types.Decimal128,
      index: true,
    },
  },
  {
    collection: 'user_users',
  }
);

// TODO: fix typings
// Just a demo how to annotate mongoose models
// But better to use TypeScript & Decorators with `typegoose` package.
export class UserDoc /* :: extends Mongoose$Document */ {
  _id: ObjectId;

  name: string;

  age: number;

  languages: Array<{
    language: string;
    skill: 'basic' | 'fluent' | 'native';
  }>;

  contacts: {
    email: string;
    phones: string[];
  };

  gender: 'male' | 'female';

  address?: any;
  someMixed?: any;
  salaryDecimal?: any;
}

UserSchema.index({ gender: 1, age: -1 });

// TODO: replace any by UserDoc
export const User = model<any>('User', UserSchema);

export const UserTC = composeMongoose(User, { schemaComposer });

UserTC.addFields({
  virtualField: {
    type: 'String',
    args: {
      lang: 'String',
    },
    resolve: (source, args, context, info) => {
      // following vars have autocompletion (excepts args in Flow)
      return source.contacts.email + context.ip + info.fieldName;
    },
  },
});
