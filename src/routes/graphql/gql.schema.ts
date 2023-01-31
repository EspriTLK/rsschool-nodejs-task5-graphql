import {buildSchema} from 'graphql'

export const gqlSchema = buildSchema(`
type User {
	id: String
	firstName: String
	lastName: String
	email: String
	subscribedToUserIds: [String]
	posts: [Post]
	profile: Profile
	memberType: MemberType
  }

  type Post {
	id: ID
	title: String
	content: String
	userId: String
  }

  type Profile {
	id: String
	avatar: String
	sex: String
	birthday: Int
	country: String
	street: String
	city: String
	memberTypeId: String
	userId: String
  }

  type MemberType {
	id: String
	discount: Int
	monthPostsLimit: Int
  }

  input UserInput {
	id: String
	firstName: String!
	lastName: String!
	email: String!
	subscribeToUserIds: [String]
  }

  type Query {
	getAllProfiles: [Profile]
	getAllPosts: [Post]
	getAllMemberTypes: [MemberType]
	getAllUsers: [User]
	getUser(id: ID): User
  }

  type Mutation {
	createUser(input: UserInput): User
  }
  
  `)