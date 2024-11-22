// version 1.3 2020-08-30 (C) AAB van der Heijden
// Updated 2.0 2024-11-22
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const $id = document.getElementById.bind(document);

Element.prototype.addClass = function (className)
{
    this.classList.add(className);
    return this;
};

Element.prototype.removeClass = function (className)
{
    this.classList.remove(className);
    return this;
};

Element.prototype.toggleClass = function (className)
{
    this.classList.toggle(className);
    return this;
};

Element.prototype.hasClass = function (className)
{
    return this.classList.contains(className);
};

Element.prototype.show = function ()
{
    this.style.display = '';
    return this;
};

Element.prototype.hide = function ()
{
    this.style.display = 'none';
    return this;
};

Element.prototype.toggleVisibility = function ()
{
    this.style.display = this.style.display === 'none' ? '' : 'none';
    return this;
};

Element.prototype.on = function (event, selectorOrHandler, handler)
{
    if (typeof selectorOrHandler === 'function')
    {
        this.addEventListener(event, selectorOrHandler);
    }
    else
    {
        this.addEventListener(event, function (e)
        {
            if (e.target.matches(selectorOrHandler))
            {
                handler.call(e.target, e);
            }
        });
    }
    return this;
};

Element.prototype.off = function (event, handler)
{
    this.removeEventListener(event, handler);
    return this;
};

NodeList.prototype.addClass = function (className)
{
    this.forEach(el => el.addClass(className));
    return this;
};

NodeList.prototype.removeClass = function (className)
{
    this.forEach(el => el.removeClass(className));
    return this;
};

NodeList.prototype.toggleClass = function (className)
{
    this.forEach(el => el.toggleClass(className));
    return this;
};

NodeList.prototype.on = function (event, selectorOrHandler, handler)
{
    this.forEach(el => el.on(event, selectorOrHandler, handler));
    return this;
};

NodeList.prototype.off = function (event, handler)
{
    this.forEach(el => el.off(event, handler));
    return this;
};
