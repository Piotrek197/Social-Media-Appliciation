# Social Media Application


## Funcionality
At the begining user can log in or create a new account. After creating an account user can see main page, that displays posts from subscribed users.
At the top there are five options - search, chat, profile, create a post and sign out.  If user click at magnyifying glass then the search bar is activated and user can look for posts based on key words.
On the profile view user can see own posts, followers and list of users he is following. When user see profile of another user then is an option to follow.

It's a CRUD Application. User can create, read, update and delete specific posts.


![image](https://user-images.githubusercontent.com/65012447/136159351-04fb6d71-2351-47ad-bee3-092056fb536a.png)


## Validation
User registration and login is validated so user cannot choose the name that is already used, cannot be too short, and also regular expression is used to allow only specific characters.
Password cannot be too short and too long. Email also must be uniqe and must have valid email format. To save a post user must provide some text in both inputs. (title, actual post).
If user wants to edit post and he is not an author then it redirects him to main page and display message "You don't have rights".
If user write incorrect page address it redirects him to 404 page.

![image](https://user-images.githubusercontent.com/65012447/136159724-e08df680-1e7b-4df3-8178-19c23cba78ce.png)

## Execution Improvement
After providing some text input, it sends a request after user stop typing (not after every key press).
