


var test = 'GET HTTP:\/\/charity.cs.uwlax.edu\/a\/b?c=d&e=f#ghi HTTP\/1.1\nHost: charity.cs.uwlax.edu\nConnection: keep-alive\nPragma: no-cache\nCache-Control: no-cache\nUpgrade-Insecure-Requests: 1\nUser-Agent: Mozilla\/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/55.0.2883.95 Safari\/537.36\nAccept: text\/html,application\/xhtml+xml,application\/xml;q=0.9,image\/webp,*\/*;q=0.8\nAccept-Encoding: gzip, deflate, sdch\nAccept-Language: en-US,en;q=0.8,nb;q=0.6\n\nThis is the body';


function HttpRequest(test) {
var segment = test.split("\n");
var a=segment[0]

//initialize variables 
var Header ={}
var Query={}
var Body=""
let isHeadersSection = true;

//loop from which segement start
for (let i = 1; i < segment.length; i++) {
    const seg = segment[i].trim();

    if (isHeadersSection && seg === "") {  //checking end of header
        isHeadersSection = false;
    } else if (isHeadersSection) {
        const [header, value] = seg.split(": ");
        Header[header] = value;
        
        // Check if it's a query part
        if (header.toLowerCase() === 'host') {
            const queryString = segment[0].split('?')[1].split('#')[0]; 
            if (queryString) {
                const params = queryString.split('&');
                params.forEach(param => {
                    const [key, val] = param.split('=');
                    Query[key] = val;
                });
            }
        }
    } else {

        //body segement concatenate
        Body += seg;
    }
}

 return {
   headers:Header,
   query: Query,
   body:Body,
   method: segment[0].split (" ")[0],
   path:segment[0].split("edu")[1].split("?")[0],
   url:segment[0].split("edu")[1].split(" ")[0],
   version: segment[0].split(" ")[2],
   fragment:segment[0].split("#")[1].split(" ")[0],
   host:segment[0].split ("//")[1].split("/")[0],
   port:segment[0].split(" ")[1].split(":")[0]=="HTTP"?80:443,
   protocol:segment[0].split(" ")[1].split(":")[0],
}
}
var a= HttpRequest(test)
console.log(a);