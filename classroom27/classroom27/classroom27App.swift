//
//  classroom27App.swift
//  classroom27
//
//  Created by Simukelo Ntshaba on 2025/12/24.
//

import SwiftUI
import CoreData

@main
struct classroom27App: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
