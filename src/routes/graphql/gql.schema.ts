import {buildSchema} from 'graphql'
export const gqlSchema = buildSchema(`
type User {
	id: String
	firstName: String
	lastName: String
	email: String
	subscribeToUserIds: [ID]
	posts: [Post]
	profile: Profile
	memberType: MemberType
  }

  type Post {
	id: ID
	title: String
	content: String
	userId: ID
  }

  type Profile {
	id: ID
	avatar: String
	sex: String
	birthday: Int
	country: String
	street: String
	city: String
	memberTypeId: String
	userId: ID
  }

  type MemberType {
	id: String
	discount: Int
	monthPostsLimit: Int
  }

  input UserInput {
	id: ID
	firstName: String!
	lastName: String!
	email: String!
	subscribeToUserIds: [String]
  }

  type Query {
	getAllUsers: [User]
	getUser(id: ID): User
  }

  type Mutation {
	createUser(input: UserInput): User
  }
  
  `)