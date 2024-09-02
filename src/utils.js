module.exports = {
    readFlash: function (session) {
      let flashMessage = "";
      if (session.flash){
        flashMessage = session.flash;
        session.flash = "";
      }
      return flashMessage;
    },
    //recieves url and set of new params,
    //updates params and returns new url
    // withNewParams('/list?page=1', {page: 2}) ->'/list?page=2'
    withNewParams: function (uri, params, path) {
        let [pathname, paramString] = uri.split('?');
        let searchParams = new URLSearchParams(paramString);
        for(const [param, value] of Object.entries(params)){
            searchParams.set(param, value);
        }
        //if we need to change route as well
        if (path !== undefined) {
            pathname = path;
        }
        return `${pathname}?${searchParams.toString()}`;
    }
  }
