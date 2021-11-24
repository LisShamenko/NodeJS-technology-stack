import { Pipe } from "@angular/core";
import { Product } from "./../models/Product/product.model";

// --------------- pure

// pure сообщает Angular, когда должен вызываться метод transform: 
//      - true - новое значение вычисляется каналом при изменении аргументов метода
//      transform, такой канал называется чистым (pure), у него нет собственных 
//      данных состояния 
//      - false - создает не чистый канал, то есть канал будет содержать собственные 
//      данные состояния, которые не могут быть обнаружены системой обновления Angular,
//      метод transform будет вызываться при любых изменениях данных, поэтому не чистые
//      каналы должны быть максимально простыми, иначе это может повредить быстродействию

// - Angular не обнаруживает изменения в массивах автоматически, поэтому при изменении
//      содержимого массива метод transform чистого канала вызываться не будет

@Pipe({
    name: "filterPipe",
    pure: false
})
export class CategoryFilterPipe {
    transform(products: Product[], category: string): Product[] {
        if (category == undefined) {
            return products;
        }
        return products.filter(p => p.category == category);
    }
}