chrome.bookmarks.getTree((marks)=>{
    marks.forEach(element => {
        console.log(element.title);
    });
});
