import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ChatMainComponent } from './components/chat-main/chat-main.component';
import { MainIndexComponent } from './components/main-index/main-index.component';
import { MainNotFoundComponent } from './components/main-not-found/main-not-found.component';
import { UserProfileManageComponent } from './components/user-profile-manage/user-profile-manage.component';
import { ChatMessagePipe } from './pipes/chatMessage.pipe';
import { ChatShareModalComponent } from './components/chat-share-modal/chat-share-modal.component';
import { ChatMarkdownInfoModalComponent } from './components/chat-markdown-info-modal/chat-markdown-info-modal.component';

const appRoutes: Routes = [
	{ path: '', component: MainIndexComponent },

	{ path: 'chat/:id', component: ChatMainComponent },
	{ path: 'main/index', component: MainIndexComponent },


	{ path: '**', component: MainNotFoundComponent },
];

@NgModule( {
	declarations: [
		AppComponent,
		ChatMainComponent,
		MainIndexComponent,
		MainNotFoundComponent,
		UserProfileManageComponent,
		ChatMessagePipe,
		ChatShareModalComponent,
		ChatMarkdownInfoModalComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		RouterModule.forRoot(
			appRoutes,
			{ enableTracing: false } // <-- debugging purposes only
		)
	],
	providers: [],
	bootstrap: [AppComponent]
} )
export class AppModule { }
