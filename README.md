# netproxy

Synchronous calls:

```javascript
netproxy("./api/helloworld", null, function ()
{
  alert(this.Message);
});

netproxy("./api/post", 
{ 
  model: 
  {
    user: 'alphons' 
  } 
}, function()
{
  alert(this.Message);
});
```
Asynchronous calls:

```javascript
result = await netproxyasync("./api/helloworld", null);
alert(result.Message);

result = await netproxyasync("./api/post", 
{ 
  model: 
  {
    user: 'alphons' 
  } 
});
alert(result.Message);

```
