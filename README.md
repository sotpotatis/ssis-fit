<img alt="The logo of the app" src="resources/app_logo_svg.svg" width="250"/>

# SSIS Fitbit App

This is an application I've written for displaying school-related data for [Stockholm Science & Innovation School](https://ssis.se)
on a Fitbit watch!

This is my first Fitbit application ever and my first project using the Fitbit SDK, so I learned a lot and also created some relevant functions
and libraries to make future development easier.

**The app can be downloaded [here](https://gallery.fitbit.com/details/8c504a85-a012-43f9-b302-378a9396a3e1).**

_The current version of the app is built for the Fitbit Versa 3 and the Fitbit Sense, the currently available devices on the Fitbit SDK v5._

## Features

### Lunch menu

The daily lunch menu is just a tap away, right on your wrist! The lunch menu is retrieved from my [own API](https://lunchmeny.albins.website).

### Schedule

What's the next lesson? Worry no more ;) Using the school's own API, the schedule with lesson, room and teacher information is now also brought
to your wrist.

> **Info**
>
> Also see the [Changelog](CHANGELOG.md) for update information.

## Development

Here is how to set up a local development environment:

### Folder structure

The Fitbit app is inside the `ssis/` folder.

App screenshots are inside the `screenshots/` folder. There is also a video available in the `website/` folder
called `app.gif`.

A website with information about the app (work in progress) is available inside the `website/` folder and currently
also at https://20alse.ssis.nu/fit.

### Notes before developing

It takes some time to learn the Fitbit SDK. If you have not used it before, here are some great documentation pages that may help you
(this is not a complete list, you'll have to do some searching yourself):

- [SDK overview](https://dev.fitbit.com/build/guides/application/)
- [SVG overview](https://dev.fitbit.com/build/guides/user-interface/svg/)
- [Messaging API](https://dev.fitbit.com/build/guides/communications/messaging/)
- [Companion](https://dev.fitbit.com/build/guides/companion/)
- [Tile lists & tile list pools](https://dev.fitbit.com/build/guides/user-interface/svg-components/views/#tile-list)

### Setup

1. Clone the repository.
2. Run `npm install`.
3. Although testing live is the best, getting the [Fitbit OS simulator]() is great for quickly debugging changes.
   After downloading, make sure to configure it for the Versa 3 by navigating to "Settings"->"Device type" and choose "Versa 3" (atlas)
   or "Sense" (vulcan).
4. Now you can `npx fitbit`. You might have to log in if it is your first time using the tool.
5. For building and installing the app, type `bi` (short for `build-and-install`). For installing the app without rebuilding,
   type `install`.
6. Before committing, take use of the automatic code formatting on commit ([Prettier](https://prettier.io/)) by using [Pre-commit](https://pre-commit.com/).
   Run `pre-commit install` to install the code formatter.

### Dependencies

Other that the Fitbit SDK tools, [Luxon](https://moment.github.io/luxon/) is the only dependency.

## Icons

This project uses icons from the [Material Design Icons](https://pictogrammers.com/library/mdi/). They are in the `resource/` folder.
Material Design Icons is licenced under [Apache 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE). Many thanks for great icons!

## To-do list/wishlist

- [x] Automatically scroll to active schedule item

- [ ] Implement backswipe functionality (backswiping currently will exit the app)

### Troubleshooting

#### The app displays a "timeout" error

If you have your phone with you, there's a possibility your phone took a while to connect and that everything will work if you close the app and then open it again.

The connection interface from the watch to your phone (used for retrieving the menu and schedule) is a part of Fitbit's API.
You should probably try the [troubleshooting from Fitbit](https://help.fitbit.com/articles/en_US/Help_article/1866.htm). In extreme cases, it might also help [reinstalling the app](https://community.fitbit.com/t5/SDK-Development/Companion-app-is-not-loading-in-the-Fitbit-App/td-p/2487225).
If you believe there is an error in my code, you're welcome to open a pull request!
