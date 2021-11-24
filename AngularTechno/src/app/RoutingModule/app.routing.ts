import { Routes, RouterModule } from "@angular/router";
import { RoutingFormComponent } from "./components/routing_form.component";
import { RoutingTableComponent } from "./components/routing_table.component";
import { TestRouterOutletComponent } from "./components/test_router_outlet.component";

// --------------- пример объявления роутера в файле

const routes: Routes = [
    {
        path: "form/edit",
        component: RoutingFormComponent
    },
    {
        path: "form/create",
        component: RoutingFormComponent
    },
    {
        path: "form/:mode",
        component: RoutingFormComponent
    },
    {
        path: "form/:mode/:id",
        component: RoutingFormComponent
    },
    {
        path: "",
        component: RoutingTableComponent
    },
];

export const RouterModuleRouting = RouterModule.forRoot(routes);