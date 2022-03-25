# Perfect size
An AI-based size recommerder system

![](https://raw.githubusercontent.com/jcamilov/webtailor/master/public/man.png)

See it in action: **https://www.youtube.com/watch?v=RhUoc0kcQZU**

Give it a try: **https://perfectsize.netlify.app/**

(this is by no means a finished product but a work in progress as I am adding new features and looking for ways to optimize performance)

------------

### About this project

**The problem** 

Appareal retailers face around 30% of returns that peaks over 50% in holidays and specials days like black friday. This causes a big impact on business revenue as well as environmental negative effects. Nearly half of the returns are related to sizing issues[1][2]. This problem grew due to the increment in ecommerce transations during and after COVID-19.

I decided to implement a tool that might help reduce such negative impact by allowing users to get a size recommendation according to his/her specific body measuremnts matched with the item measuremnts (which btw changes from brand to brand). It is intended for online stores.


### Notes
- All the processing is done in the user's device so no video or images are stored in any cloud. 
- By now it has been only tested on desktop.
- Performance depends on the user's device but the loading time in a computer with core i3 processor, 8GB RAM takes about 5 seconds. This is a decent time that can be hidden if the model is loaded on page start (not done this way so far).


### Next features to be implemented
- Face bluring. Although no personal information is stored
- Fine tune position recognition to make it more robust a different angles of the camera.
- Testing in mobile devices.



------------

### Main development points
- ReactJS App
- It uses mediapipe as the AI tool to get a body mask
- Deployed in netlify



[1] https://www.cnbc.com/2019/01/10/growing-online-sales-means-more-returns-and-trash-for-landfills.html

[2] https://inviqa.com/blog/ecommerce-returns-problem-and-how-tackle-it
